<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStationsStore } from '../stores/stations';
import { GlobeAmericasIcon, ArrowsUpDownIcon } from '@heroicons/vue/24/outline';
import { SparklesIcon } from '@heroicons/vue/24/solid';
import SearchBar from '../components/SearchBar.vue';
import AdBanner from '../components/AdBanner.vue';
import AdInline from '../components/AdInline.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const store = useStationsStore();
const router = useRouter();
const searchQuery = ref('');
const sortOrder = ref('count_desc');

const sortOptions = [
  { label: 'Nombre (A-Z)', value: 'name_asc' },
  { label: 'Nombre (Z-A)', value: 'name_desc' },
  { label: 'Más estaciones', value: 'count_desc' },
  { label: 'Menos estaciones', value: 'count_asc' },
];

onMounted(() => {
  if (store.availableCountries.length === 0) {
    store.fetchFilters();
  }
});

const getFlagUrl = (isoCode) => {
  if (!isoCode) return null;
  return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
};

const goToRandomCountry = () => {
  const validCountries = store.availableCountries.filter(c => c.stationcount > 0);
  if (validCountries.length === 0) return;
  
  const random = validCountries[Math.floor(Math.random() * validCountries.length)];
  
  router.push({
    name: 'country-stations',
    params: { name: random.name || 'uncategorized' },
    query: { iso: random.iso_3166_1 }
  });
};

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

const processedCountries = computed(() => {
  const query = searchQuery.value.toLowerCase();
  
  let result = store.availableCountries
    .map(c => {
      let displayName = c.name;
      if (c.iso_3166_1) {
        try {
          displayName = regionNames.of(c.iso_3166_1);
        } catch (e) {
          // Fallback to original name if translation fails
        }
      }
      return {
        ...c,
        displayName: displayName || 'Resto del Mundo',
        originalName: c.name, // Keep original for routing
        hasFlag: !!c.iso_3166_1
      };
    })
    .filter(c => {
      // Filtrar por búsqueda (en español)
      if (query && !c.displayName.toLowerCase().includes(query)) return false;
      // Mostrar solo si tiene estaciones
      return c.stationcount > 0;
    });

  return result.sort((a, b) => {
    switch (sortOrder.value) {
      case 'name_asc':
        return a.displayName.localeCompare(b.displayName);
      case 'name_desc':
        return b.displayName.localeCompare(a.displayName);
      case 'count_desc':
        return b.stationcount - a.stationcount;
      case 'count_asc':
        return a.stationcount - b.stationcount;
      default:
        return 0;
    }
  });
});
</script>

<template>
  <div class="p-6 pb-24 md:pb-6">
    <header class="mb-8">
      <h1 class="text-3xl font-bold mb-6 flex items-center gap-3">
        <GlobeAmericasIcon class="w-8 h-8 text-primary" />
        Países
      </h1>
      
      <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div class="flex gap-3 w-full max-w-md">
          <SearchBar 
            v-model="searchQuery" 
            placeholder="Buscar país..." 
            class="flex-1"
          />
          <button 
            @click="goToRandomCountry"
            class="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors group border border-transparent hover:border-[#1DB954] flex-shrink-0"
            title="Descubrir país aleatorio"
          >
            <SparklesIcon class="w-5 h-5 text-[#1DB954] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <!-- Sort Select -->
        <div class="flex items-center bg-[#282828] rounded-full px-4 py-2 border border-transparent hover:border-gray-700 transition-colors">
            <ArrowsUpDownIcon class="w-5 h-5 text-[#1DB954] mr-2" />
            <select 
              v-model="sortOrder" 
              class="bg-transparent text-white text-sm font-bold outline-none cursor-pointer appearance-none"
            >
                <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value" class="bg-[#282828]">
                    {{ opt.label }}
                </option>
            </select>
        </div>
      </div>
    </header>

    <!-- Ad Banner - Countries -->
    <AdBanner />

    <div v-if="store.loading && store.availableCountries.length === 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <SkeletonLoader type="card" :count="20" height="h-32" />
    </div>

    <div v-else>
      <TransitionGroup 
        tag="div" 
        name="list" 
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <router-link 
          v-for="(country, index) in processedCountries" 
          :key="country.originalName || 'unknown'"
          :to="{ 
            name: 'country-stations', 
            params: { name: country.originalName || 'uncategorized' },
            query: { iso: country.iso_3166_1 }
          }"
          class="bg-[#181818] rounded-md p-4 flex flex-col items-center hover:bg-[#282828] transition-all duration-300 group cursor-pointer shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
          :style="{ animationDelay: `${Math.min(index, 10) * 50}ms` }"
        >
          <div class="w-16 h-12 mb-3 bg-black/20 rounded shadow-sm overflow-hidden flex items-center justify-center relative">
              <img 
              v-if="country.hasFlag" 
              :src="getFlagUrl(country.iso_3166_1)" 
              :alt="country.displayName"
              class="w-full h-full object-cover"
              loading="lazy"
            >
            <GlobeAmericasIcon v-else class="w-8 h-8 text-gray-600" />
          </div>
          
          <h3 class="font-medium text-center text-sm mb-1 group-hover:text-primary line-clamp-2">{{ country.displayName }}</h3>
          <span class="text-xs text-gray-500">{{ country.stationcount }} estaciones</span>
        </router-link>
      </TransitionGroup>
    </div>

    <!-- Ad Inline - Countries -->
    <AdInline position="countries" />

    <div v-if="!store.loading && processedCountries.length === 0" class="text-center py-20 text-gray-500">
      No se encontraron países.
    </div>
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
