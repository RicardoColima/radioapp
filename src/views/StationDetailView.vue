<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStationsStore } from '../stores/stations';
import { usePlayerStore } from '../stores/player';
import { radioApi } from '../services/api';
import StationCard from '../components/StationCard.vue';
import AdBanner from '../components/AdBanner.vue';
import AdInline from '../components/AdInline.vue';
import ShareButton from '../components/ShareButton.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { PlayIcon, PauseIcon, HeartIcon, PlusIcon, HandThumbUpIcon, MagnifyingGlassIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/solid';
import { HeartIcon as HeartIconOutline, HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/vue/24/outline';
import { onClickOutside, useFullscreen } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const stationsStore = useStationsStore();
const playerStore = usePlayerStore();
const stationContainer = ref(null);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(stationContainer);

const station = ref(null);
const loading = ref(true);
const error = ref(null);
const relatedLoading = ref(false);

const isPlaying = computed(() => {
  return station.value && playerStore.currentStation?.stationuuid === station.value.stationuuid && playerStore.isPlaying;
});

const isFavorite = computed(() => {
  return station.value && stationsStore.isFavorite(station.value.stationuuid);
});

const hasVoted = computed(() => {
    return station.value && stationsStore.hasVoted(station.value.stationuuid);
});

// Search Logic (Duplicated from Home as requested)
const searchQuery = ref('');
const showSearchResults = ref(false);
const searchResults = ref([]);
const searchContainer = ref(null);
let searchTimeout;

onClickOutside(searchContainer, () => {
  showSearchResults.value = false;
});

const performInstantSearch = async () => {
    if (searchQuery.value.length < 2) return;
    try {
        const results = await radioApi.searchStations({ name: searchQuery.value, limit: 5 });
        searchResults.value = results;
        showSearchResults.value = true;
    } catch (e) {
        console.error(e);
    }
}

const debounceSearch = (e) => {
    searchQuery.value = e.target.value;
    if (searchTimeout) clearTimeout(searchTimeout);
    if (searchQuery.value.length < 2) {
        showSearchResults.value = false;
        return;
    }
    searchTimeout = setTimeout(performInstantSearch, 500);
}

const goToSearch = () => {
    router.push({ name: 'search', query: { q: searchQuery.value } });
    showSearchResults.value = false;
}

const selectSearchResult = (st) => {
    playerStore.playStation(st);
    showSearchResults.value = false;
    searchQuery.value = '';
    // Navigate to new station
    const slug = st.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    router.push(`/station/${slug}-${st.stationuuid}`);
}

const extractUuid = (param) => {
    // Matches standard UUID at end of string
    const match = param.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
    return match ? match[0] : param;
};

const fetchStationData = async () => {
  loading.value = true;
  error.value = null;
  const idParam = route.params.id;
  const uuid = extractUuid(idParam);
  
  try {
    const fetchedStation = await radioApi.getStationByUuid(uuid);
    if (!fetchedStation) {
      error.value = "Estación no encontrada";
    } else {
      station.value = fetchedStation;
      fetchRelated(fetchedStation);
    }
  } catch (e) {
    error.value = "Error al cargar la estación";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const fetchRelated = async (st) => {
  relatedLoading.value = true;
  await stationsStore.fetchRelatedStations(st);
  relatedLoading.value = false;
};

const togglePlay = () => {
  if (station.value) {
    playerStore.playStation(station.value);
  }
};

const toggleFavorite = () => {
  if (station.value) {
    stationsStore.toggleFavorite(station.value);
  }
};

const handleVote = async () => {
    if (station.value) {
        const result = await stationsStore.voteForStation(station.value);
        if (result === 'added') {
            station.value.votes = (station.value.votes || 0) + 1;
        } else if (result === 'removed') {
            station.value.votes = Math.max(0, (station.value.votes || 0) - 1);
        }
    }
};

const goBack = () => {
  router.back();
};

const fallbackImage = (e) => {
  e.target.src = 'https://placehold.co/300x300/282828/FFF?text=Radio';
};

watch(() => route.params.id, () => {
  fetchStationData();
});

onMounted(() => {
  stationsStore.init(); // Ensure favorites/categories are loaded
  fetchStationData();
});
</script>

<template>
  <div ref="stationContainer" class="p-6 pb-24 min-h-screen bg-[#121212] transition-all duration-300" :class="{ 'p-0 pb-0 flex flex-col justify-center': isFullscreen }">
    <!-- Header with Search -->
    <div v-if="!isFullscreen" class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button @click="goBack" class="text-gray-400 hover:text-white flex items-center gap-2 self-start md:self-auto">
            &larr; Volver
        </button>

        <div class="relative w-full md:w-1/3 z-20" ref="searchContainer">
            <div class="relative">
                <input 
                    type="text" 
                    v-model="searchQuery"
                    @input="debounceSearch"
                    @keyup.enter="goToSearch"
                    @keydown.esc="showSearchResults = false"
                    placeholder="Buscar emisora..." 
                    class="w-full bg-[#282828] text-white pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
                <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <div v-if="showSearchResults && searchQuery.length >= 2" class="absolute top-full left-0 right-0 bg-[#222] mt-2 rounded-lg shadow-xl overflow-hidden border border-gray-700 max-h-80 overflow-y-auto">
                <div v-if="searchResults.length > 0">
                    <div 
                        v-for="res in searchResults" 
                        :key="res.stationuuid"
                        @click="selectSearchResult(res)"
                        class="p-3 hover:bg-[#333] cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-800 last:border-0"
                    >
                        <img :src="res.favicon || 'https://placehold.co/100x100/282828/FFF?text=R'" class="w-8 h-8 rounded object-cover bg-black" />
                        <div class="flex-1 overflow-hidden">
                            <h4 class="text-white text-sm font-bold truncate">{{ res.name }}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <!-- Header Skeleton -->
      <div class="flex flex-col md:flex-row gap-8 items-center md:items-end bg-gray-800/20 p-6 rounded-xl mb-8">
        <SkeletonLoader type="rectangle" height="h-52" width="w-52" class="rounded-lg shrink-0" />
        <div class="flex-1 w-full flex flex-col items-center md:items-start gap-4">
          <SkeletonLoader type="text" height="h-4" width="w-24" />
          <SkeletonLoader type="text" height="h-12" width="w-3/4" />
          <SkeletonLoader type="text" height="h-6" width="w-1/2" />
          <div class="flex gap-2">
            <SkeletonLoader type="text" :count="3" height="h-8" width="w-16" />
          </div>
          <div class="flex gap-4 mt-4 w-full justify-center md:justify-start">
             <SkeletonLoader type="rectangle" height="h-14" width="w-40" class="rounded-full" />
             <SkeletonLoader type="circle" height="h-14" width="w-14" />
             <SkeletonLoader type="circle" height="h-14" width="w-14" />
          </div>
        </div>
      </div>
      
      <!-- Stats Skeleton -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <SkeletonLoader type="rectangle" :count="4" height="h-24" />
      </div>

      <!-- Related Skeleton -->
      <div>
        <SkeletonLoader type="text" height="h-8" width="w-64" class="mb-6" />
        <SkeletonLoader type="card" :count="6" height="h-48" />
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <h2 class="text-2xl font-bold text-red-500">{{ error }}</h2>
      <button @click="goBack" class="mt-4 px-4 py-2 bg-white text-black rounded-full font-bold">Regresar</button>
    </div>

    <div v-else-if="station">
      <!-- Station Hero -->
      <div class="flex flex-col md:flex-row gap-8 items-center md:items-end bg-gradient-to-b from-gray-800/50 to-transparent p-6 rounded-xl relative overflow-hidden">
        <!-- Background Blur -->
        <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" :style="{ background: `url(${station.favicon}) center/cover` }"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[#121212]/50 to-[#121212] z-0"></div>

        <div class="relative z-10 w-52 h-52 shadow-2xl shrink-0 group">
          <img 
            :src="station.favicon || 'https://placehold.co/300x300/282828/FFF?text=Radio'" 
            @error="fallbackImage"
            alt="Station Logo" 
            class="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div class="flex-1 text-center md:text-left relative z-10">
            <span class="text-xs font-bold uppercase tracking-wider text-green-500">Radio Station</span>
            <h1 class="text-4xl md:text-6xl font-bold text-white mt-2 mb-4 drop-shadow-lg">{{ station.name }}</h1>
            <p class="text-gray-300 text-lg mb-6">{{ station.country }} • {{ station.language }}</p>
            <div class="flex gap-2 mb-6 text-sm text-gray-400 justify-center md:justify-start flex-wrap">
                <span v-for="tag in station.tags.split(',').slice(0,5)" :key="tag" class="bg-white/10 px-2 py-1 rounded">
                    {{ tag.trim() }}
                </span>
            </div>
            
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button 
                    @click="togglePlay"
                    class="bg-green-500 text-black rounded-full p-4 hover:scale-105 transition-transform hover:bg-green-400 flex items-center gap-2 font-bold px-8 shadow-lg shadow-green-500/20"
                >
                    <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6" />
                    {{ isPlaying ? 'PAUSAR' : 'REPRODUCIR' }}
                </button>

                <button 
                    @click="toggleFavorite"
                    class="p-3 rounded-full border border-gray-500 hover:border-white text-gray-400 hover:text-white transition-colors"
                    :class="{ '!text-green-500 !border-green-500': isFavorite }"
                    title="Favoritos"
                >
                    <component :is="isFavorite ? HeartIcon : HeartIconOutline" class="w-6 h-6" />
                </button>

                <button 
                    @click="stationsStore.openAddModal(station)"
                    class="p-3 rounded-full border border-gray-500 hover:border-white text-gray-400 hover:text-white transition-colors"
                    title="Agregar a Lista"
                >
                    <PlusIcon class="w-6 h-6" />
                </button>

                <button 
                    @click="handleVote"
                    class="flex items-center gap-2 p-3 rounded-full border border-gray-500 hover:border-white text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                    :class="{ '!text-blue-500 !border-blue-500 bg-blue-500/10': hasVoted }"
                    title="Votar"
                >
                    <component :is="hasVoted ? HandThumbUpIcon : HandThumbUpOutline" class="w-6 h-6" />
                    <span class="font-bold">{{ station.votes }}</span>
                </button>

                <ShareButton 
                  :station="station" 
                  size="normal"
                  class="p-3 rounded-full border border-gray-500 hover:border-white text-gray-400 hover:text-white transition-colors"
                />

                <button 
                    @click="toggleFullscreen"
                    class="p-3 rounded-full border border-gray-500 hover:border-white text-gray-400 hover:text-white transition-colors hidden md:block"
                    title="Pantalla Completa"
                >
                    <component :is="isFullscreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon" class="w-6 h-6" />
                </button>
            </div>
        </div>
      </div>

      <!-- Stats / Details -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[#181818] p-4 rounded-lg">
              <span class="text-gray-400 text-xs uppercase">Bitrate</span>
              <p class="text-xl font-bold">{{ station.bitrate }} kbps</p>
          </div>
           <div class="bg-[#181818] p-4 rounded-lg">
              <span class="text-gray-400 text-xs uppercase">Votos Totales</span>
              <p class="text-xl font-bold">{{ station.votes }}</p>
          </div>
           <div class="bg-[#181818] p-4 rounded-lg">
              <span class="text-gray-400 text-xs uppercase">Codec</span>
              <p class="text-xl font-bold">{{ station.codec }}</p>
          </div>
           <div class="bg-[#181818] p-4 rounded-lg truncate">
              <span class="text-gray-400 text-xs uppercase">Web</span>
              <a :href="station.homepage" target="_blank" class="text-green-500 hover:underline block truncate">{{ station.homepage }}</a>
          </div>
      </div>

      <!-- Related Stations -->
      <div class="mt-12">
        <h3 class="text-2xl font-bold text-white mb-6">También podría gustarte</h3>
        
        <div v-if="relatedLoading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="n in 18" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </div>

        <div v-else-if="stationsStore.relatedStations.length > 0">
             <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div v-for="relStation in stationsStore.relatedStations" :key="relStation.stationuuid">
                    <StationCard :station="relStation" />
                </div>
             </div>
        </div>
        <div v-else class="text-gray-400">No se encontraron estaciones relacionadas.</div>
      </div>

      <!-- Ad Inline - Station Detail -->
      <AdInline position="station-detail" />
    </div>
  </div>
</template>
