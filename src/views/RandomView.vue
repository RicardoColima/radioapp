<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStationsStore } from '../stores/stations';
import { usePlayerStore } from '../stores/player';
import { radioApi } from '../services/api';
import { PlayIcon, PauseIcon, HeartIcon, PlusIcon, HandThumbUpIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid';
import { HeartIcon as HeartIconOutline, HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/vue/24/outline';
import { onClickOutside } from '@vueuse/core';
import AdBanner from '../components/AdBanner.vue';
import AdInline from '../components/AdInline.vue';
import ShareButton from '../components/ShareButton.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const router = useRouter();
const stationsStore = useStationsStore();
const playerStore = usePlayerStore();

const currentStation = ref(null);
const loading = ref(false);
const error = ref(null);

// Search Logic
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
    const slug = st.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    router.push(`/station/${slug}-${st.stationuuid}`);
}

const fetchRandomStation = async () => {
  // console.log('fetchRandomStation called');
  loading.value = true;
  error.value = null;
  try {
    // Try different approach - get more stations and pick one randomly
    const stations = await radioApi.searchStations({ 
      limit: 50, 
      hidebroken: true 
    });
    
    // console.log('Stations received:', stations);
    
    if (stations.length > 0) {
      // Pick a random station from the results
      const randomIndex = Math.floor(Math.random() * stations.length);
      currentStation.value = stations[randomIndex];
      // console.log('Random station selected:', currentStation.value);
    } else {
      error.value = 'No se encontraron estaciones aleatorias.';
    }
  } catch (e) {
    error.value = 'Error al cargar estación aleatoria.';
    // console.error('Error in fetchRandomStation:', e);
  } finally {
    loading.value = false;
    // console.log('Loading set to false');
  }
};

const isPlaying = computed(() => {
  return currentStation.value && playerStore.currentStation?.stationuuid === currentStation.value.stationuuid && playerStore.isPlaying;
});

const isFavorite = computed(() => {
  return currentStation.value && stationsStore.isFavorite(currentStation.value.stationuuid);
});

const hasVoted = computed(() => {
    return currentStation.value && stationsStore.hasVoted(currentStation.value.stationuuid);
});

const togglePlay = () => {
  if (currentStation.value) {
    playerStore.playStation(currentStation.value);
  }
};

const toggleFavorite = () => {
  if (currentStation.value) {
    stationsStore.toggleFavorite(currentStation.value);
  }
};

const handleVote = async () => {
    if (currentStation.value) {
        const result = await stationsStore.voteForStation(currentStation.value);
        if (result === 'added') {
            currentStation.value.votes = (currentStation.value.votes || 0) + 1;
        } else if (result === 'removed') {
            currentStation.value.votes = Math.max(0, (currentStation.value.votes || 0) - 1);
        }
    }
};

const getNewRandom = () => {
  // console.log('getNewRandom called');
  fetchRandomStation();
};

const fallbackImage = (e) => {
  e.target.src = 'https://placehold.co/300x300/282828/FFF?text=Radio';
};

onMounted(() => {
  fetchRandomStation();
});
</script>

<template>
  <div class="p-6 pb-24 min-h-screen">
    <!-- Header with Search -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div class="text-gray-400 hover:text-white flex items-center gap-2 self-start md:self-auto">
            <SparklesIcon class="w-5 h-5 text-primary" />
            Estación Aleatoria
        </div>

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

    <div v-if="loading && !currentStation" class="animate-pulse">
      <!-- Header Skeleton -->
      <div class="flex flex-col md:flex-row gap-8 items-center md:items-end bg-gray-800/20 p-6 rounded-xl mb-8">
        <SkeletonLoader type="rectangle" height="h-52" width="w-52" class="rounded-lg shrink-0" />
        <div class="flex-1 w-full flex flex-col items-center md:items-start gap-4">
          <SkeletonLoader type="text" height="h-4" width="w-32" />
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
    </div>

    <div v-else-if="error" class="text-center py-20">
      <SparklesIcon class="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-red-500 mb-4">{{ error }}</h2>
      <button @click="getNewRandom" class="px-6 py-2 bg-primary hover:bg-green-600 text-black font-bold rounded-full">
        Descubrir Estación
      </button>
    </div>

    <div v-else-if="currentStation">
      <!-- Station Hero -->
      <div class="flex flex-col md:flex-row gap-8 items-center md:items-end bg-gradient-to-b from-gray-800/50 to-transparent p-6 rounded-xl relative overflow-hidden">
        <!-- Background Blur -->
        <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" :style="{ background: `url(${currentStation.favicon}) center/cover` }"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[#121212]/50 to-[#121212] z-0"></div>

        <div class="relative z-10 w-52 h-52 shadow-2xl shrink-0 group">
          <img 
            :src="currentStation.favicon || 'https://placehold.co/300x300/282828/FFF?text=Radio'" 
            @error="fallbackImage"
            alt="Station Logo" 
            class="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div class="flex-1 text-center md:text-left relative z-10">
            <span class="text-xs font-bold uppercase tracking-wider text-green-500">Radio Station Aleatoria</span>
            <h1 class="text-4xl md:text-6xl font-bold text-white mt-2 mb-4 drop-shadow-lg">{{ currentStation.name }}</h1>
            <p class="text-gray-300 text-lg mb-6">{{ currentStation.country }} • {{ currentStation.language }}</p>
            <div class="flex gap-2 mb-6 text-sm text-gray-400 justify-center md:justify-start flex-wrap">
                <span v-for="tag in currentStation.tags.split(',').slice(0,5)" :key="tag" class="bg-white/10 px-2 py-1 rounded">
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
                    @click="stationsStore.openAddModal(currentStation)"
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
                    <span class="font-bold">{{ currentStation.votes }}</span>
                </button>

                <button 
                    @click="getNewRandom"
                    :disabled="loading"
                    class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                >
                    <SparklesIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
                    Descubrir Otra
                </button>

                <ShareButton 
                  v-if="currentStation"
                  :station="currentStation" 
                  size="normal"
                  class="p-3 rounded-full border border-gray-500 hover:border-white text-gray-400 hover:text-white transition-colors"
                />
            </div>
        </div>
      </div>

      <!-- Stats / Details -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[#181818] p-4 rounded-lg">
              <span class="text-gray-400 text-xs uppercase">Bitrate</span>
              <p class="text-xl font-bold">{{ currentStation.bitrate }} kbps</p>
          </div>
           <div class="bg-[#181818] p-4 rounded-lg">
              <span class="text-gray-400 text-xs uppercase">Votos Totales</span>
              <p class="text-xl font-bold">{{ currentStation.votes }}</p>
          </div>
           <div class="bg-[#181818] p-4 rounded-lg">
              <span class="text-gray-400 text-xs uppercase">Codec</span>
              <p class="text-xl font-bold">{{ currentStation.codec }}</p>
          </div>
           <div class="bg-[#181818] p-4 rounded-lg truncate">
              <span class="text-gray-400 text-xs uppercase">Web</span>
              <a :href="currentStation.homepage" target="_blank" class="text-green-500 hover:underline block truncate">{{ currentStation.homepage }}</a>
          </div>
      </div>

      <!-- Ad Inline - Random Station -->
      <AdInline position="random" />
    </div>
  </div>
</template>

