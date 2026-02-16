<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStationsStore } from '../stores/stations';
import { usePlayerStore } from '../stores/player';
import StationCard from '../components/StationCard.vue';
import { PlayIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/solid';
import { radioApi } from '../services/api';
import { onClickOutside } from '@vueuse/core';

const store = useStationsStore();
const playerStore = usePlayerStore();
const router = useRouter();

const currentHeroIndex = ref(0);
let heroInterval;

onMounted(() => {
  store.fetchHomeData();
  startHeroCarousel();
});

onUnmounted(() => {
  if (heroInterval) clearInterval(heroInterval);
});

const startHeroCarousel = () => {
  heroInterval = setInterval(() => {
    if (store.featuredStations.length > 0) {
      currentHeroIndex.value = (currentHeroIndex.value + 1) % store.featuredStations.length;
    }
  }, 5000); // Change every 5 seconds
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos Días';
  if (hour < 18) return 'Buenas Tardes';
  return 'Buenas Noches';
};

const playFeatured = (station) => {
  if (station) {
    playerStore.playStation(station);
  }
};

const navigateToFiltered = (type, value) => {
  router.push({ 
    name: 'search', 
    query: { [type]: value } 
  });
};

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

const selectResult = (station) => {
    playerStore.playStation(station);
    showSearchResults.value = false;
    searchQuery.value = '';
}

const reloadDiscovery = () => {
    store.fetchRandomDiscovery();
};
</script>

<template>
  <div class="p-6 pb-24">
     <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">{{ getGreeting() }}</h2>
            <div v-if="store.globalStats" class="text-xs text-gray-400 mt-1">
                Más de {{ store.globalStats.stations }} estaciones en {{ store.globalStats.countries }} países
            </div>
        </div>
        
        <!-- Home Search -->
        <div class="relative w-full md:w-1/3 z-20" ref="searchContainer">
            <div class="relative">
                <input 
                    type="text" 
                    v-model="searchQuery"
                    @input="debounceSearch"
                    @keyup.enter="goToSearch"
                    @keydown.esc="showSearchResults = false"
                    placeholder="Buscar emisora, género..." 
                    class="w-full bg-[#282828] text-white pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
                <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <!-- Instant Results Dropdown -->
            <div v-if="showSearchResults && searchQuery.length >= 2" class="absolute top-full left-0 right-0 bg-[#222] mt-2 rounded-lg shadow-xl overflow-hidden border border-gray-700 max-h-80 overflow-y-auto">
                <div v-if="searchResults.length > 0">
                    <div 
                        v-for="station in searchResults" 
                        :key="station.stationuuid"
                        @click="selectResult(station)"
                        class="p-3 hover:bg-[#333] cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-800 last:border-0"
                    >
                        <img :src="station.favicon || 'https://placehold.co/100x100/282828/FFF?text=R'" class="w-8 h-8 rounded object-cover bg-black" />
                        <div class="flex-1 overflow-hidden">
                            <h4 class="text-white text-sm font-bold truncate">{{ station.name }}</h4>
                            <p class="text-xs text-gray-400 truncate">{{ station.country }} • {{ station.tags }}</p>
                        </div>
                        <PlayIcon class="w-5 h-5 text-green-500" />
                    </div>
                    <button @click="goToSearch" class="w-full p-2 text-center text-xs text-green-500 font-bold hover:bg-[#333]">
                        VER TODOS LOS RESULTADOS
                    </button>
                </div>
                <div v-else class="p-4 text-center text-gray-500 text-sm">
                    No se encontraron resultados
                </div>
            </div>
        </div>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="text-center py-20">
      <div class="bg-red-500/10 p-6 rounded-lg inline-block">
        <h2 class="text-xl font-bold text-red-500 mb-2">¡Ups! Algo salió mal</h2>
        <p class="text-gray-400 mb-4">{{ store.error }}</p>
        <button 
          @click="store.fetchHomeData()" 
          class="px-6 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Hero Carousel -->
      <div v-if="store.featuredStations.length > 0" class="relative h-[250px] md:h-[350px] w-full overflow-hidden rounded-xl mb-10 shadow-2xl bg-[#121212]">
          <TransitionGroup name="fade">
            <div 
                v-for="(station, index) in store.featuredStations" 
                :key="station.stationuuid"
                v-show="currentHeroIndex === index"
                class="absolute inset-0 bg-cover bg-center"
                :style="{ backgroundImage: `url(${station.favicon || 'https://placehold.co/800x400/181818/FFF?text=Radio'})` }"
            >
                <div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent flex items-center p-8 md:p-12">
                    <div class="max-w-xl">
                        <span class="inline-block px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full mb-4">RECOMENDADO</span>
                        <h1 class="text-3xl md:text-5xl font-bold text-white mb-2 line-clamp-2 leading-tight">{{ station.name }}</h1>
                        <p class="text-gray-300 mb-6 text-sm md:text-base line-clamp-2">{{ station.tags }} • {{ station.country }}</p>
                        <div class="flex gap-3">
                            <button 
                                @click="playFeatured(station)"
                                class="bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <PlayIcon class="w-5 h-5" /> Escuchar
                            </button>
                            <button 
                                @click="router.push(`/station/${station.stationuuid}`)"
                                class="bg-white/10 text-white px-6 py-2.5 rounded-full font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
                            >
                                Info
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </TransitionGroup>
          
          <!-- Indicators -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <button 
                v-for="(_, idx) in store.featuredStations" 
                :key="idx"
                @click="currentHeroIndex = idx"
                class="w-2 h-2 rounded-full transition-all"
                :class="currentHeroIndex === idx ? 'bg-green-500 w-6' : 'bg-white/50 hover:bg-white'"
              ></button>
          </div>
      </div>
      <!-- Skeleton Hero -->
      <div v-else class="h-[250px] md:h-[350px] bg-[#181818] rounded-xl mb-10 animate-pulse"></div>
    
    <!-- Recently Played (History) -->
    <section v-if="store.history.length > 0" class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Recientemente Escuchado</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StationCard v-for="station in store.history.slice(0, 16)" :key="station.stationuuid" :station="station" />
      </div>
    </section>

    <!-- Top Stations (6 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Más Populares</h2>
        <button @click="navigateToFiltered('sort', 'votes')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <template v-if="store.loading && store.topStations.length === 0">
           <div v-for="n in 6" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.topStations.slice(0, 6)" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- Trending (8 items - Most Voted) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Tendencias (Más Votadas)</h2>
         <button @click="navigateToFiltered('sort', 'votes')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.trendingStations.length === 0">
           <div v-for="n in 8" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.trendingStations.slice(0, 8)" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- Latino (16 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Ritmos Latinos</h2>
         <button @click="navigateToFiltered('tag', 'latino')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.latinStations.length === 0">
           <div v-for="n in 16" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.latinStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>
    
    <!-- Rock (16 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Rock Classics</h2>
         <button @click="navigateToFiltered('tag', 'rock')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.rockStations.length === 0">
           <div v-for="n in 16" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.rockStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- Pop (16 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Pop Hits</h2>
         <button @click="navigateToFiltered('tag', 'pop')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.popStations.length === 0">
           <div v-for="n in 16" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.popStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- News (16 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Noticias</h2>
         <button @click="navigateToFiltered('tag', 'news')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.newsStations.length === 0">
           <div v-for="n in 16" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.newsStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- Electronic (16 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Electrónica</h2>
         <button @click="navigateToFiltered('tag', 'electronic')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.electroStations.length === 0">
           <div v-for="n in 16" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.electroStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- Sports (16 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Deportes</h2>
         <button @click="navigateToFiltered('tag', 'sports')" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">Ver Todo</button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
         <template v-if="store.loading && store.sportsStations.length === 0">
           <div v-for="n in 16" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.sportsStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    <!-- Random Discovery (36 items) -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Descubrimiento Aleatorio</h2>
        <button 
            @click="reloadDiscovery" 
            class="flex items-center gap-2 text-sm font-bold text-green-500 hover:text-green-400 uppercase tracking-wider transition-colors bg-[#282828] px-4 py-2 rounded-full"
        >
            <ArrowPathIcon class="w-4 h-4" />
            Recargar estaciones
        </button>
      </div>
      
       <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-9 gap-4">
         <template v-if="store.loading && store.randomDiscoveryStations.length === 0">
           <div v-for="n in 36" :key="n" class="bg-[#181818] h-48 rounded-md animate-pulse"></div>
        </template>
        <template v-else>
            <StationCard v-for="station in store.randomDiscoveryStations" :key="station.stationuuid" :station="station" />
        </template>
      </div>
    </section>

    </template>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
