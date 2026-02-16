<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStationsStore } from '../stores/stations';
import StationCard from '../components/StationCard.vue';
import SearchBar from '../components/SearchBar.vue';
import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/vue/24/outline';

const store = useStationsStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const showFilters = ref(false);

const filters = ref({
  country: '',
  genre: '',
  language: '',
  bitrate: '',
  sort: 'clickcount'
});

const sortOptions = [
  { label: 'Popularidad', value: 'clickcount' },
  { label: 'Votos', value: 'votes' },
  { label: 'Nombre (A-Z)', value: 'name' },
  { label: 'Aleatorio', value: 'random' }
];

const bitrateOptions = [
    { label: 'Cualquiera', value: '' },
    { label: '> 64 kbps', value: '64' },
    { label: '> 128 kbps', value: '128' },
    { label: '> 192 kbps', value: '192' },
    { label: '> 320 kbps', value: '320' }
];

const handleSearch = (query) => {
  const queryParams = {};
  if (query) queryParams.q = query;
  if (filters.value.country) queryParams.country = filters.value.country;
  if (filters.value.genre) queryParams.tag = filters.value.genre;
  if (filters.value.language) queryParams.language = filters.value.language;
  if (filters.value.bitrate) queryParams.bitrate = filters.value.bitrate;
  if (filters.value.sort !== 'clickcount') queryParams.sort = filters.value.sort;
  
  router.replace({ query: queryParams });
  
  performSearch(query);
};

const performSearch = (query) => {
  if (!query && !filters.value.country && !filters.value.genre && !filters.value.language && !filters.value.bitrate && filters.value.sort === 'clickcount') {
      store.searchTopStations();
      return;
  }

  const params = {
    name: query,
    country: filters.value.country,
    tag: filters.value.genre,
    language: filters.value.language,
    bitrateMin: filters.value.bitrate,
    order: filters.value.sort === 'random' ? '' : filters.value.sort,
    reverse: filters.value.sort !== 'name'
  };
  
  store.search(params);
};

const updateFilter = () => {
  handleSearch(searchQuery.value);
};

const resetFilters = () => {
    filters.value = {
        country: '',
        genre: '',
        language: '',
        bitrate: '',
        sort: 'clickcount'
    };
    searchQuery.value = '';
    handleSearch('');
}

const syncFromUrl = () => {
  const { q, country, tag, language, bitrate, sort } = route.query;
  
  searchQuery.value = q || '';
  filters.value.country = country || '';
  filters.value.genre = tag || '';
  filters.value.language = language || '';
  filters.value.bitrate = bitrate || '';
  filters.value.sort = sort || 'clickcount';
  
  performSearch(searchQuery.value);
};

onMounted(() => {
  store.fetchFilters();
  syncFromUrl();
});

watch(() => route.query, () => {
  syncFromUrl();
});
</script>

<template>
  <div class="p-6 pb-24 md:pb-6 min-h-screen">
    <div class="sticky top-0 bg-black/95 backdrop-blur-sm z-30 py-4 -mx-6 px-6 mb-6 border-b border-gray-800">
      <h2 class="text-3xl font-bold text-white mb-6 hidden md:block">Buscar</h2>
      <SearchBar v-model="searchQuery" @search="handleSearch" placeholder="Artistas, canciones o estaciones" />
      
      <!-- Filter Toggle & Active Chips -->
      <div class="flex flex-wrap items-center gap-2 mt-4">
          <button 
            @click="showFilters = !showFilters"
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#282828] text-white text-sm font-bold hover:bg-[#333] transition-colors"
            :class="{ '!bg-green-500 !text-black': showFilters }"
          >
            <FunnelIcon class="w-4 h-4" />
            Filtros
          </button>

          <!-- Sort Select -->
          <div class="flex items-center bg-[#282828] rounded-full px-3 py-2">
             <ArrowsUpDownIcon class="w-4 h-4 text-gray-400 mr-2" />
             <select 
                v-model="filters.sort" 
                @change="updateFilter"
                class="bg-transparent text-white text-sm font-bold outline-none cursor-pointer appearance-none pr-2"
             >
                 <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value" class="bg-[#282828]">
                     {{ opt.label }}
                 </option>
             </select>
          </div>

          <!-- Active Filter Chips (Clearable) -->
          <button v-if="filters.country" @click="filters.country = ''; updateFilter()" class="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-green-500/30">
              {{ filters.country }} ✕
          </button>
          <button v-if="filters.genre" @click="filters.genre = ''; updateFilter()" class="px-3 py-1 bg-blue-500/20 text-blue-500 border border-blue-500 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-blue-500/30">
              {{ filters.genre }} ✕
          </button>
          <button v-if="filters.bitrate" @click="filters.bitrate = ''; updateFilter()" class="px-3 py-1 bg-purple-500/20 text-purple-500 border border-purple-500 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-purple-500/30">
              > {{ filters.bitrate }}kbps ✕
          </button>
          
          <button v-if="filters.country || filters.genre || filters.language || filters.bitrate || searchQuery" @click="resetFilters" class="ml-auto text-xs text-gray-400 hover:text-white underline">
              Limpiar todo
          </button>
      </div>

      <!-- Expanded Filters Panel -->
      <div v-if="showFilters" class="mt-4 p-4 bg-[#181818] rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <!-- Country Filter -->
          <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-400 uppercase">País</label>
              <select v-model="filters.country" @change="updateFilter" class="bg-[#282828] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-green-500">
                  <option value="">Todos</option>
                  <option v-for="c in store.availableCountries" :key="c.name" :value="c.name">
                      {{ c.name }} ({{ c.stationcount }})
                  </option>
              </select>
          </div>

          <!-- Genre Filter -->
          <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-400 uppercase">Género</label>
              <select v-model="filters.genre" @change="updateFilter" class="bg-[#282828] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-green-500">
                  <option value="">Todos</option>
                  <option v-for="t in store.availableTags" :key="t.name" :value="t.name">
                      {{ t.name }} ({{ t.stationcount }})
                  </option>
              </select>
          </div>

          <!-- Language Filter -->
          <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-400 uppercase">Idioma</label>
              <select v-model="filters.language" @change="updateFilter" class="bg-[#282828] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-green-500">
                  <option value="">Todos</option>
                  <option v-for="l in store.availableLanguages" :key="l.name" :value="l.name">
                      {{ l.name }} ({{ l.stationcount }})
                  </option>
              </select>
          </div>

          <!-- Bitrate Filter -->
          <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-400 uppercase">Calidad</label>
              <select v-model="filters.bitrate" @change="updateFilter" class="bg-[#282828] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-green-500">
                  <option v-for="opt in bitrateOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                  </option>
              </select>
          </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="text-center py-10">
       <p class="text-red-400 mb-2">{{ store.error }}</p>
       <button @click="handleSearch(searchQuery)" class="text-sm underline text-white hover:text-primary">Reintentar</button>
    </div>

    <!-- Results -->
    <div v-else-if="store.loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="store.searchResults.length > 0">
      <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">Resultados</h3>
          <span class="text-xs text-gray-400">{{ store.searchResults.length }} estaciones encontradas</span>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <StationCard 
          v-for="station in store.searchResults" 
          :key="station.stationuuid" 
          :station="station" 
        />
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-gray-800 p-6 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <h3 class="text-white font-bold text-lg">No se encontraron resultados</h3>
      <p class="text-gray-400 max-w-xs mt-2">Intenta ajustar los filtros o buscar con otros términos.</p>
      <button @click="resetFilters" class="mt-4 text-green-500 font-bold hover:underline">Limpiar búsqueda</button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
