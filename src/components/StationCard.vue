<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useStationsStore } from '../stores/stations';
import { PlayIcon, PauseIcon, HeartIcon, PlusIcon } from '@heroicons/vue/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/vue/24/outline';
import ShareButton from './ShareButton.vue';

const props = defineProps({
  station: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const playerStore = usePlayerStore();
const stationsStore = useStationsStore();

const isPlaying = computed(() => {
  return playerStore.currentStation?.stationuuid === props.station.stationuuid && playerStore.isPlaying;
});

const isCurrent = computed(() => {
  return playerStore.currentStation?.stationuuid === props.station.stationuuid;
});

const isFavorite = computed(() => {
  return stationsStore.isFavorite(props.station.stationuuid);
});

const togglePlay = (e) => {
  // Event handled by @click.stop in template
  playerStore.playStation(props.station);
};

const toggleFavorite = (e) => {
  // Event handled by @click.stop in template
  stationsStore.toggleFavorite(props.station);
};

const openAddModal = (e) => {
  stationsStore.openAddModal(props.station);
}

const navigateToDetail = () => {
  const slug = props.station.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  router.push(`/station/${slug}-${props.station.stationuuid}`);
};

const fallbackImage = (e) => {
  e.target.src = 'https://placehold.co/300x300/282828/FFF?text=Radio';
};
</script>

<template>
  <div 
    class="group relative bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-all duration-300 cursor-pointer flex flex-col gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl"
    @click="navigateToDetail"
  >
    <div class="relative aspect-square w-full rounded-md overflow-hidden bg-black shadow-lg mb-2">
      <img 
        :src="station.favicon || 'https://placehold.co/300x300/282828/FFF?text=Radio'" 
        @error="fallbackImage"
        alt="Station Logo" 
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      <!-- Play Overlay (Desktop) -->
      <div 
        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        :class="{ 'opacity-100 bg-black/60': isCurrent }"
      >
        <button 
          @click.stop="togglePlay"
          class="bg-green-500 text-black rounded-full p-3 shadow-xl hover:scale-105 transition-transform duration-200 hover:bg-green-400 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0"
          :class="{ 'scale-100 translate-y-0': isCurrent }"
        >
          <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6 text-black" :class="{ 'w-8 h-8': isCurrent }" />
        </button>
      </div>

      <!-- Live Indicator -->
      <div v-if="isCurrent && isPlaying" class="absolute top-2 right-2 flex gap-1 items-end h-3">
        <span class="w-1 h-3 bg-green-500 animate-pulse"></span>
        <span class="w-1 h-2 bg-green-500 animate-pulse delay-75"></span>
        <span class="w-1 h-3 bg-green-500 animate-pulse delay-150"></span>
      </div>
    </div>

    <div class="flex flex-col gap-1 min-h-[60px]">
      <div class="flex justify-between items-start">
          <h3 class="font-bold text-white truncate flex-1" :class="{ 'text-green-500': isCurrent }">{{ station.name }}</h3>
          
          <!-- Mobile Actions (Always visible on mobile, hidden on desktop hover) -->
          <div class="md:hidden flex gap-2">
             <button @click.stop="togglePlay" class="text-white">
                <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-5 h-5" />
             </button>
             <ShareButton 
               :station="station" 
               size="small"
               class="text-white"
             />
          </div>
      </div>
      
      <div class="flex flex-col text-xs text-[#b3b3b3]">
        <span class="truncate">{{ station.country }}</span>
        <div class="flex items-center gap-2 mt-1">
          <span v-if="station.bitrate" class="bg-[#333] px-1.5 py-0.5 rounded text-[10px] text-white">{{ station.bitrate }}k</span>
          <span class="truncate opacity-70">{{ station.tags }}</span>
        </div>
      </div>
    </div>

    <!-- Desktop Hover Actions -->
    <div class="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
        <button 
        @click.stop="toggleFavorite"
        class="p-2 rounded-full bg-black/50 text-white hover:text-green-500 hover:scale-110 transition-all"
        :class="{ 'text-green-500': isFavorite }"
        title="Favoritos"
        >
        <component :is="isFavorite ? HeartIcon : HeartIconOutline" class="w-5 h-5" />
        </button>

        <button 
        @click.stop="openAddModal"
        class="p-2 rounded-full bg-black/50 text-white hover:text-green-500 hover:scale-110 transition-all"
        title="Agregar a lista"
        >
        <PlusIcon class="w-5 h-5" />
        </button>

        <ShareButton 
          :station="station" 
          size="small"
          class="p-2 rounded-full bg-black/50 text-white hover:text-green-500 hover:scale-110 transition-all"
        />
    </div>
    
    <!-- Mobile specific Add button (bottom right) -->
    <button 
        @click.stop="openAddModal"
        class="md:hidden absolute bottom-4 right-4 p-2 text-gray-400 hover:text-white"
    >
        <PlusIcon class="w-5 h-5" />
    </button>

  </div>
</template>
