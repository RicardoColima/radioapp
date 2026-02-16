<script setup>
import { computed } from 'vue';
import { useStationsStore } from '../stores/stations';
import StationCard from '../components/StationCard.vue';
import { HeartIcon } from '@heroicons/vue/24/solid';

const store = useStationsStore();

// Ensure favorites are loaded
store.init();

const hasFavorites = computed(() => store.favorites.length > 0);
</script>

<template>
  <div class="p-6 pb-24 md:pb-6">
    <div class="flex items-center gap-4 mb-8 mt-4 md:mt-0">
      <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded shadow-lg flex items-center justify-center">
        <HeartIcon class="w-6 h-6 md:w-8 md:h-8 text-white" />
      </div>
      <div>
        <h2 class="text-3xl md:text-5xl font-bold text-white">Mis Me Gusta</h2>
        <p class="text-sm text-gray-400 mt-1">{{ store.favorites.length }} estaciones</p>
      </div>
    </div>

    <div v-if="hasFavorites" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      <StationCard 
        v-for="station in store.favorites" 
        :key="station.stationuuid" 
        :station="station" 
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <p class="text-gray-400">Aún no has agregado estaciones a tus favoritos.</p>
      <router-link to="/search" class="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">
        Buscar Estaciones
      </router-link>
    </div>
  </div>
</template>
