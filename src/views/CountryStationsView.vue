<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { radioApi } from '../services/api';
import StationCard from '../components/StationCard.vue';
import AdBanner from '../components/AdBanner.vue';
import AdInline from '../components/AdInline.vue';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const countryName = ref(route.params.name);

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

const fetchStations = async () => {
  // console.log('Fetching stations for:', countryName.value);
  loading.value = true;
  error.value = null;
  try {
    if (countryName.value === 'uncategorized') {
      // console.log('Searching uncategorized stations');
      stations.value = await radioApi.searchStations({ country: '', limit: 100 });
    } else {
      // console.log('Calling API for country:', countryName.value);
      stations.value = await radioApi.getStationsByCountry(countryName.value, 100);
      // console.log('Stations loaded:', stations.value.length);
    }
  } catch (e) {
    console.error('Error fetching stations:', e);
    error.value = 'Error al cargar las estaciones.';
  } finally {
    loading.value = false;
    // console.log('Loading set to false');
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

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-20 text-red-500">
      {{ error }}
    </div>

    <div v-else-if="stations.length === 0" class="text-center py-20 text-gray-500">
      No se encontraron estaciones para este país.
    </div>

    <div v-else>
      <TransitionGroup 
        tag="div" 
        name="list" 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <StationCard 
          v-for="(station, index) in stations" 
          :key="station.stationuuid" 
          :station="station"
          :style="{ animationDelay: `${Math.min(index, 10) * 50}ms` }"
        />
      </TransitionGroup>
    </div>

    <!-- Ad Inline - Country Stations -->
    <AdInline position="country-stations" />
  </div>
</template>

<style scoped>
.list-enter-active {
  animation: fadeInUp 0.5s ease cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.list-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  opacity: 0;
  transform: scale(0.9);
}

.list-move {
  transition: all 0.5s ease;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
