<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useStationsStore } from '../stores/stations';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon } from '@heroicons/vue/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/vue/24/outline';
import ShareButton from './ShareButton.vue';

const router = useRouter();
const playerStore = usePlayerStore();
const stationsStore = useStationsStore();

const station = computed(() => playerStore.currentStation);
const isFavorite = computed(() => station.value && stationsStore.isFavorite(station.value.stationuuid));

const togglePlay = () => {
  playerStore.togglePlay();
};

const navigateToDetail = () => {
  if (station.value) {
    const slug = station.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    router.push(`/station/${slug}-${station.value.stationuuid}`);
  }
};

const toggleMute = () => {
  if (playerStore.volume > 0) {
    playerStore.setVolume(0);
  } else {
    playerStore.setVolume(70);
  }
};

const onVolumeChange = (e) => {
  playerStore.setVolume(e.target.value);
};

const toggleFavorite = () => {
  if (station.value) {
    stationsStore.toggleFavorite(station.value);
  }
};

const fallbackImage = (e) => {
  e.target.src = 'https://placehold.co/100x100/282828/FFF?text=Radio';
};
</script>

<template>
  <div 
    v-if="station" 
    class="fixed bottom-[60px] md:bottom-0 left-0 right-0 h-24 md:h-20 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 z-50 shadow-2xl"
  >
    <!-- Station Info -->
    <div class="flex items-center gap-3 w-1/3 min-w-[120px]">
      <div class="flex items-center gap-3 cursor-pointer group" @click="navigateToDetail">
        <img 
            :src="station.favicon || 'https://placehold.co/100x100/282828/FFF?text=Radio'" 
            @error="fallbackImage"
            alt="Logo" 
            class="h-14 w-14 rounded object-cover bg-[#282828] hidden sm:block shadow-md group-hover:opacity-80 transition-opacity"
            :class="{ 'animate-spin-slow': playerStore.isLoading }"
        />
        <div class="flex flex-col overflow-hidden justify-center h-full">
            <h4 class="text-sm font-bold text-white truncate group-hover:text-green-500 transition-colors">{{ station.name }}</h4>
            <span class="text-xs text-[#b3b3b3] truncate">{{ station.country }}</span>
        </div>
      </div>
      <button @click.stop="toggleFavorite" class="ml-2 text-[#b3b3b3] hover:text-white transition-colors">
        <component :is="isFavorite ? HeartIcon : HeartIconOutline" class="w-5 h-5" :class="{ 'text-green-500': isFavorite }" />
      </button>
      <ShareButton 
        v-if="station"
        :station="station" 
        size="small"
        class="ml-2 text-[#b3b3b3] hover:text-white transition-colors"
      />
    </div>

    <!-- Controls -->
    <div class="flex flex-col items-center justify-center w-1/3 max-w-[400px]">
      <div class="flex items-center gap-6">
        <button class="text-[#b3b3b3] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.87l3.195 1.841c1.25.72 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.348-2.805-1.628L12 8.93V6.19c0-1.44-1.555-2.348-2.805-1.628l-7.108 4.09C.96 9.365 0 10.3 0 11.44c0 1.14.96 2.075 2.092 2.787l7.103 4.213z" />
            </svg>
        </button>

        <button 
          @click="togglePlay"
          class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          :disabled="playerStore.isLoading"
        >
          <div v-if="playerStore.isLoading" class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <component v-else :is="playerStore.isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6" />
        </button>
        
        <button class="text-[#b3b3b3] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                 <path d="M5.055 7.06c-1.25-.72-2.805.189-2.805 1.628v8.125c0 1.44 1.555 2.348 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.348 2.805 1.628l7.108-4.161C23.04 13.577 24 12.641 24 11.5c0-1.14-.96-2.076-2.092-2.787l-7.103-4.137c-1.25-.72-2.805.188-2.805 1.628v2.36L5.055 7.06z" />
            </svg>
        </button>
      </div>
      <div v-if="playerStore.error" class="text-[10px] text-red-500 mt-1 absolute -bottom-3">
        {{ playerStore.error }}
      </div>
    </div>

    <!-- Volume -->
    <div class="flex items-center justify-end gap-2 w-1/3 group">
      <button @click="toggleMute" class="text-[#b3b3b3] hover:text-white transition-colors">
        <component :is="playerStore.volume === 0 ? SpeakerXMarkIcon : SpeakerWaveIcon" class="w-5 h-5" />
      </button>
      
      <div class="w-20 md:w-28 h-1 bg-[#4d4d4d] rounded-full relative group">
        <div 
            class="absolute top-0 left-0 h-full bg-[#b3b3b3] group-hover:bg-green-500 rounded-full" 
            :style="{ width: playerStore.volume + '%' }"
        ></div>
        <input 
            type="range" 
            min="0" 
            max="100" 
            :value="playerStore.volume" 
            @input="onVolumeChange"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            :style="{ left: playerStore.volume + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
