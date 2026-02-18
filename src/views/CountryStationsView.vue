<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { radioApi } from '../services/api';
import StationCard from '../components/StationCard.vue';
import AdBanner from '../components/AdBanner.vue';
import AdInline from '../components/AdInline.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { useIntersectionObserver } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const countryName = ref(route.params.name);
const loadMoreTrigger = ref(null);

const displayTitle = computed(() => {
  if (countryName.value === 'uncategorized') return 'Resto del Mundo';
  
  // Try to translate if we have ISO code in query
  if (route.query.iso) {
    try {
      const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
      return regionNames.of(route.query.iso);
    } catch (e) {
      // Fallback
    }
  }
  return countryName.value;
});

const stations = ref([]);
const loading = ref(true);
const error = ref(null);

// Pagination state
const offset = ref(0);
const limit = 20;
const hasMore = ref(true);
const loadingMore = ref(false);

const fetchStations = async (isLoadMore = false) => {
  if (isLoadMore) {
    if (!hasMore.value || loadingMore.value) return;
    loadingMore.value = true;
  } else {
    // Scroll main content to top on new fetch
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
    
    loading.value = true;
    error.value = null;
    offset.value = 0;
    stations.value = [];
    hasMore.value = true;
  }

  try {
    let newStations = [];
    const params = {
      country: countryName.value === 'uncategorized' ? '' : countryName.value,
      limit,
      offset: offset.value,
      order: 'clickcount', 
      reverse: true
    };
    
    newStations = await radioApi.searchStations(params);

    if (newStations.length < limit) {
      hasMore.value = false;
    }

    if (isLoadMore) {
      const existingIds = new Set(stations.value.map(s => s.stationuuid));
      const uniqueNew = newStations.filter(s => !existingIds.has(s.stationuuid));
      
      if (uniqueNew.length > 0) {
        stations.value.push(...uniqueNew);
      } else if (newStations.length > 0) {
         // We got results but all were duplicates. 
         // This implies we might have issues with offset or the data is static/cached weirdly.
         // To prevent an infinite loop of fetching the same duplicates, we stop here or skip ahead.
         // For safety, let's stop auto-loading to break the loop.
         hasMore.value = false;
      }
    } else {
      stations.value = newStations;
    }
    
    offset.value += newStations.length;
  } catch (e) {
    console.error('Error fetching stations:', e);
    if (!isLoadMore) {
        error.value = 'Error al cargar las estaciones.';
    }
    hasMore.value = false; 
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

watch(() => route.params.name, (newVal) => {
  if (newVal) {
    countryName.value = newVal;
    fetchStations();
  }
});

onMounted(() => {
  fetchStations();
});

// Debounce helper
let timeout = null;

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value && !loading.value && !loadingMore.value) {
      // Clear existing timeout
      if (timeout) clearTimeout(timeout);
      
      // Add small delay to prevent rapid firing and allow UI to settle
      timeout = setTimeout(() => {
         if (hasMore.value && !loading.value && !loadingMore.value) {
            fetchStations(true);
         }
      }, 800);
    }
  },
  { threshold: 0.1 } // Trigger when 10% visible
);

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="p-6 pb-24 md:pb-6">
    <header class="mb-8">
      <button 
        @click="goBack" 
        class="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm font-medium group"
      >
        <ArrowLeftIcon class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver a países
      </button>
      <h1 class="text-3xl font-bold mb-2 flex items-center gap-3">
        <span class="text-primary">Estaciones de</span> {{ displayTitle }}
      </h1>
      <p class="text-gray-400">Explora las mejores radios de {{ displayTitle }}</p>
    </header>

    <!-- Ad Banner - Country Stations -->
    <AdBanner />

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <SkeletonLoader type="card" :count="12" height="h-32" />
    </div>

    <div v-else-if="error" class="text-center py-20 text-red-500">
      {{ error }}
    </div>

    <div v-else-if="stations.length === 0" class="text-center py-20 text-gray-500">
      No se encontraron estaciones para este país.
    </div>

    <div v-else>
      <div 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <StationCard 
          v-for="(station) in stations" 
          :key="station.stationuuid" 
          :station="station"
        />
      </div>
    </div>

    <!-- Infinite Scroll Trigger - Keep in DOM to prevent flickering, only hide if no more results -->
    <div ref="loadMoreTrigger" class="h-10 w-full" v-if="hasMore"></div>

    <!-- Loading Spinner - Reserve space to prevent layout shifts -->
    <div class="py-8 flex justify-center w-full transition-opacity duration-300" 
         :class="loadingMore ? 'opacity-100' : 'opacity-0'"
         v-show="hasMore || loadingMore">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Ad Inline - Country Stations -->
    <AdInline position="country-stations" />
  </div>
</template>

<style scoped>
/* Removed TransitionGroup styles to prevent conflicts */
</style>
