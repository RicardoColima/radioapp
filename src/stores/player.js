import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStationsStore } from './stations';

export const usePlayerStore = defineStore('player', () => {
  const currentStation = ref(null);
  const isPlaying = ref(false);
  const volume = ref(100);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Audio element is not reactive in the template, but managed here
  let audio = new Audio();

  const init = () => {
    // Restore volume from local storage if available
    const savedVolume = localStorage.getItem('radio_volume');
    if (savedVolume) volume.value = parseInt(savedVolume);
    
    audio.volume = volume.value / 100;
    
    // Audio event listeners
    audio.addEventListener('playing', () => {
      isPlaying.value = true;
      isLoading.value = false;
      error.value = null;
    });
    
    audio.addEventListener('pause', () => {
      isPlaying.value = false;
    });
    
    audio.addEventListener('waiting', () => {
      isLoading.value = true;
    });
    
    audio.addEventListener('canplay', () => {
      isLoading.value = false;
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      isPlaying.value = false;
      isLoading.value = false;
      error.value = 'Error al reproducir la transmisión';
    });
  };

  const playStation = (station) => {
    const stationsStore = useStationsStore(); // Access inside action to avoid circular dep if needed, though Pinia handles it well usually
    
    if (currentStation.value?.stationuuid === station.stationuuid) {
      togglePlay();
      return;
    }

    currentStation.value = station;
    stationsStore.addToHistory(station); // Add to history
    
    isLoading.value = true;
    error.value = null;
    
    audio.src = station.url_resolved || station.url;
    audio.play().catch(e => {
      console.error("Play failed", e);
      error.value = "No se pudo reproducir esta transmisión";
      isLoading.value = false;
    });
  };

  const togglePlay = () => {
    if (isPlaying.value) {
      audio.pause();
    } else {
      if (audio.src) {
        audio.play();
      } else if (currentStation.value) {
        playStation(currentStation.value);
      }
    }
  };

  const setVolume = (val) => {
    volume.value = val;
    audio.volume = val / 100;
    localStorage.setItem('radio_volume', val);
  };

  return {
    currentStation,
    isPlaying,
    volume,
    isLoading,
    error,
    init,
    playStation,
    togglePlay,
    setVolume
  };
});
