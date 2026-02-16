import { defineStore } from 'pinia';
import { ref } from 'vue';
import { radioApi } from '../services/api';

export const useStationsStore = defineStore('stations', () => {
  const topStations = ref([]);
  const searchResults = ref([]);
  const favorites = ref([]);
  const categories = ref([]); // User defined categories
  const relatedStations = ref([]);
  const globalStats = ref(null);
  const history = ref([]);
  const userVotes = ref({}); // Map of stationuuid -> boolean
  
  // UI State
  const addingStation = ref(null);
  const showAddModal = ref(false);
  
  // Home Page Specific Data
  const featuredStation = ref(null);
  const featuredStations = ref([]);
  const trendingStations = ref([]);
  const latinStations = ref([]);
  const rockStations = ref([]);
  const popStations = ref([]);
  const newsStations = ref([]);
  const electroStations = ref([]);
  const sportsStations = ref([]);
  const randomDiscoveryStations = ref([]);
  
  // Filter Metadata
  const availableCountries = ref([]);
  const availableLanguages = ref([]);
  const availableTags = ref([]);

  const loading = ref(false);
  const error = ref(null);

  // Helper for shuffling
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const deduplicateAndShuffle = (stations, limit) => {
      const unique = [...new Map(stations.map(item => [item['stationuuid'], item])).values()];
      return shuffleArray(unique).slice(0, limit);
  };

  const fetchFilters = async () => {
    try {
        const [countries, languages, tags] = await Promise.all([
            radioApi.getCountries(),
            radioApi.getLanguages(),
            radioApi.getTags()
        ]);
        
        // Sort and filter useful data
        availableCountries.value = countries.sort((a, b) => b.stationcount - a.stationcount).slice(0, 30);
        availableLanguages.value = languages.sort((a, b) => b.stationcount - a.stationcount).slice(0, 20);
        availableTags.value = tags.sort((a, b) => b.stationcount - a.stationcount).slice(0, 30);
    } catch (e) {
        console.error("Failed to load filters", e);
    }
  };

  // Initialize from LocalStorage
  const init = () => {
    const savedFavs = localStorage.getItem('radio_favorites');
    if (savedFavs) {
        try { favorites.value = JSON.parse(savedFavs); } catch (e) { console.error(e); }
    }
    
    const savedCats = localStorage.getItem('radio_categories');
    if (savedCats) {
        try {
            const parsed = JSON.parse(savedCats);
            // Migration/Safety: Ensure all cats have id and stations array
            categories.value = parsed.map(c => ({
                ...c,
                id: c.id || Date.now().toString() + Math.random(),
                stations: Array.isArray(c.stations) ? c.stations : []
            }));
        } catch (e) { console.error('Error loading categories', e); }
    }

    const savedHistory = localStorage.getItem('radio_history');
    if (savedHistory) {
        try { history.value = JSON.parse(savedHistory); } catch (e) { console.error(e); }
    }

    const savedVotes = localStorage.getItem('radio_votes');
    if (savedVotes) {
        try { userVotes.value = JSON.parse(savedVotes); } catch (e) { console.error(e); }
    }
  };

  const fetchRandomDiscovery = async () => {
      try {
          const randoms = await radioApi.searchStations({ limit: 50, order: 'random', hidebroken: true });
          randomDiscoveryStations.value = deduplicateAndShuffle(randoms, 36);
      } catch (e) {
          console.error("Error fetching random discovery", e);
      }
  };

  const fetchHomeData = async () => {
    loading.value = true;
    try {
        const randomOffset = Math.floor(Math.random() * 20);

        // Run in parallel
        const [
            top, 
            trending, 
            latin, 
            rock, 
            pop, 
            news, 
            electro, 
            sports,
            stats
        ] = await Promise.all([
            radioApi.searchStations({ limit: 10, order: 'votes', offset: randomOffset }), // Top (Randomized offset)
            radioApi.searchStations({ limit: 10, order: 'votes', reverse: true }), // Tendencias (Most Voted)
            radioApi.getStationsByTag('latino', 20, 'random'),
            radioApi.getStationsByTag('rock', 20, 'random'),
            radioApi.getStationsByTag('pop', 20, 'random'),
            radioApi.getStationsByTag('news', 20, 'random'),
            radioApi.getStationsByTag('electronic', 20, 'random'),
            radioApi.getStationsByTag('sports', 20, 'random'),
            radioApi.getStats()
        ]);

        topStations.value = shuffleArray(top).slice(0, 6); // Display 6 random
        trendingStations.value = trending.slice(0, 8); // Display 8 most voted
        latinStations.value = deduplicateAndShuffle(latin, 16);
        rockStations.value = deduplicateAndShuffle(rock, 16);
        popStations.value = deduplicateAndShuffle(pop, 16);
        newsStations.value = deduplicateAndShuffle(news, 16);
        electroStations.value = deduplicateAndShuffle(electro, 16);
        sportsStations.value = deduplicateAndShuffle(sports, 16);
        
        globalStats.value = stats;
        
        // Featured
        const allFetched = [...top, ...trending, ...latin, ...rock, ...pop];
        const uniqueStations = [...new Map(allFetched.map(item => [item['stationuuid'], item])).values()];
        const shuffled = shuffleArray(uniqueStations);
        
        featuredStations.value = shuffled.slice(0, 5);
        if (featuredStations.value.length > 0) {
            featuredStation.value = featuredStations.value[0];
        }

        // Fetch Random 36 Grid
        await fetchRandomDiscovery();

    } catch (e) {
        console.error(e);
        error.value = 'Error cargando el inicio.';
    } finally {
        loading.value = false;
    }
  };

  const fetchTopStations = async () => {
    loading.value = true;
    try {
      topStations.value = await radioApi.getTopStations();
    } catch (e) {
      error.value = 'Error al cargar las estaciones. Intente nuevamente.';
    } finally {
      loading.value = false;
    }
  };

  const searchTopStations = async (limit = 20) => {
    loading.value = true;
    try {
      searchResults.value = await radioApi.getTopStations(limit);
    } catch (e) {
      error.value = 'Error al cargar las estaciones populares.';
    } finally {
      loading.value = false;
    }
  };

  const search = async (params) => {
    loading.value = true;
    try {
      searchResults.value = await radioApi.searchStations(params);
    } catch (e) {
      error.value = 'Error en la búsqueda. Verifique su conexión.';
    } finally {
      loading.value = false;
    }
  };

  const fetchRelatedStations = async (station) => {
     loading.value = true;
     try {
        // Get more than needed to filter duplicates
        let related = await radioApi.getRelatedStations(station, 30);
        
        // Filter out the current station and duplicates
        related = related.filter(s => s.stationuuid !== station.stationuuid);
        related = [...new Map(related.map(item => [item['stationuuid'], item])).values()];
        
        // If not enough, fetch random top stations to fill
        if (related.length < 18) {
            const randomFill = await radioApi.searchStations({ limit: 20, order: 'random' });
            const fillers = randomFill.filter(s => s.stationuuid !== station.stationuuid && !related.find(r => r.stationuuid === s.stationuuid));
            related = [...related, ...fillers];
        }

        relatedStations.value = related.slice(0, 18);
     } catch (e) {
        console.error(e);
     } finally {
        loading.value = false;
     }
  }

  const toggleFavorite = (station) => {
    const index = favorites.value.findIndex(s => s.stationuuid === station.stationuuid);
    if (index === -1) {
      favorites.value.push(station);
    } else {
      favorites.value.splice(index, 1);
    }
    localStorage.setItem('radio_favorites', JSON.stringify(favorites.value));
  };

  const isFavorite = (stationId) => {
    return favorites.value.some(s => s.stationuuid === stationId);
  };

  // Categories CRUD
  const saveCategories = () => {
    localStorage.setItem('radio_categories', JSON.stringify(categories.value));
  };

  const createCategory = (name) => {
    if (!name.trim()) return;
    const newCat = {
      id: Date.now().toString(), // Simple ID generation
      name: name.trim(),
      stations: []
    };
    categories.value.push(newCat);
    saveCategories();
  };

  const updateCategoryName = (id, newName) => {
    const cat = categories.value.find(c => c.id === id);
    if (cat && newName.trim()) {
      cat.name = newName.trim();
      saveCategories();
    }
  };
  
  const deleteCategory = (id) => {
    categories.value = categories.value.filter(c => c.id !== id);
    saveCategories();
  }

  const addToCategory = (categoryId, station) => {
    const category = categories.value.find(c => c.id === categoryId);
    if (category) {
       // Avoid duplicates
       if (!category.stations.find(s => s.stationuuid === station.stationuuid)) {
         category.stations.push(station);
         saveCategories();
       }
    }
  };
  
  const removeFromCategory = (categoryId, stationId) => {
      const category = categories.value.find(c => c.id === categoryId);
      if (category) {
          category.stations = category.stations.filter(s => s.stationuuid !== stationId);
          saveCategories();
      }
  }

  const addToHistory = (station) => {
      // Remove if exists to move to top
      const existingIdx = history.value.findIndex(s => s.stationuuid === station.stationuuid);
      if (existingIdx !== -1) {
          history.value.splice(existingIdx, 1);
      }
      
      history.value.unshift(station);
      if (history.value.length > 20) {
          history.value.pop();
      }
      
      localStorage.setItem('radio_history', JSON.stringify(history.value));
  };

  const voteForStation = async (station) => {
      const stationId = station.stationuuid;
      
      if (userVotes.value[stationId]) {
          // Remove vote locally
          delete userVotes.value[stationId];
          localStorage.setItem('radio_votes', JSON.stringify(userVotes.value));
          return 'removed';
      }
      
      const success = await radioApi.voteForStation(stationId);
      if (success) {
          userVotes.value[stationId] = true;
          localStorage.setItem('radio_votes', JSON.stringify(userVotes.value));
          return 'added';
      }
      return false;
  };

  const hasVoted = (stationId) => {
      return !!userVotes.value[stationId];
  };

  const openAddModal = (station) => {
    addingStation.value = station;
    showAddModal.value = true;
  };

  const closeAddModal = () => {
    addingStation.value = null;
    showAddModal.value = false;
  };

  return {
    topStations,
    searchResults,
    favorites,
    categories,
    relatedStations,
    globalStats,
    history,
    availableCountries,
    availableLanguages,
    availableTags,
    featuredStations,
    featuredStation,
    trendingStations,
    latinStations,
    rockStations,
    popStations,
    newsStations,
    electroStations,
    sportsStations,
    randomDiscoveryStations,
    loading,
    error,
    addingStation,
    showAddModal,
    init,
    fetchHomeData,
    fetchRandomDiscovery,
    fetchFilters,
    fetchTopStations,
    searchTopStations,
    search,
    fetchRelatedStations,
    toggleFavorite,
    addToHistory,
    voteForStation,
    hasVoted,
    isFavorite,
    createCategory,
    updateCategoryName,
    deleteCategory,
    addToCategory,
    removeFromCategory,
    openAddModal,
    closeAddModal
  };
});
