<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStationsStore } from '../stores/stations';
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import StationCard from '../components/StationCard.vue';
import AdBanner from '../components/AdBanner.vue';
import AdInline from '../components/AdInline.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const store = useStationsStore();
const loading = ref(true);

onMounted(() => {
  store.init();
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

const newCategoryName = ref('');
const showCreateModal = ref(false);
const activeCategoryId = ref(store.categories.length > 0 ? store.categories[0].id : null);

// Watch for category changes to ensure active category is valid
watch(() => store.categories, (newVal) => {
    if (newVal.length > 0 && !newVal.find(c => c.id === activeCategoryId.value)) {
        activeCategoryId.value = newVal[0].id;
    } else if (newVal.length === 0) {
        activeCategoryId.value = null;
    }
}, { deep: true });

const createCategory = () => {
  if (newCategoryName.value.trim()) {
    const newId = store.createCategory(newCategoryName.value.trim());
    newCategoryName.value = '';
    showCreateModal.value = false;
    
    // Switch to new category
    if (newId) {
        activeCategoryId.value = newId;
    }
  }
};

const deleteCategory = (category) => {
  if (confirm(`¿Estás seguro de que quieres eliminar "${category.name}"?`)) {
    store.deleteCategory(category.id);
    // Active category update handled by watcher
  }
};

const activeStations = computed(() => {
  if (!activeCategoryId.value) return [];
  const cat = store.categories.find(c => c.id === activeCategoryId.value);
  return cat ? cat.stations : [];
});

const removeFromCategory = (stationId) => {
    store.removeFromCategory(activeCategoryId.value, stationId);
}
</script>

<template>
  <div class="p-6 pb-24 md:pb-6">
    <header class="flex justify-between items-center mb-8 mt-4 md:mt-0">
      <h2 class="text-2xl md:text-3xl font-bold text-white">Tu Biblioteca</h2>
      <button 
        @click="showCreateModal = !showCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20"
      >
        <PlusIcon class="w-5 h-5" />
        <span class="md:hidden">Nueva</span>
        <span class="hidden md:inline">Nueva Categoría</span>
      </button>
    </header>
    
    <!-- Ad Banner - Categories -->
    <AdBanner />
    
    <div v-if="loading" class="mb-8">
      <div class="flex gap-4 overflow-hidden">
        <SkeletonLoader type="rectangle" :count="4" height="h-12" width="w-32" />
      </div>
      <div class="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <SkeletonLoader type="card" :count="10" height="h-48" />
      </div>
    </div>

    <!-- Inline Create Form -->
    <div v-else-if="showCreateModal" class="mb-6 bg-[#282828] p-4 rounded-lg flex gap-2">
      <input 
        v-model="newCategoryName"
        @keyup.enter="createCategory"
        type="text" 
        placeholder="Nombre de categoría" 
        class="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:ring-1 focus:ring-green-500 outline-none"
      />
      <button @click="createCategory" class="px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200">Crear</button>
    </div>

    <!-- Category Tabs -->
    <div v-if="store.categories.length > 0" class="mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <div class="flex gap-4 min-w-max">
        <button 
          v-for="cat in store.categories" 
          :key="cat.id"
          @click="activeCategoryId = cat.id"
          class="px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 group relative"
          :class="activeCategoryId === cat.id ? 'bg-[#282828] text-white shadow-lg' : 'bg-transparent text-gray-400 hover:bg-[#282828] hover:text-white'"
        >
          {{ cat.name }}
          <span 
            v-if="activeCategoryId === cat.id" 
            @click.stop="deleteCategory(cat)"
            class="ml-2 p-1 hover:text-red-500 rounded-full hover:bg-gray-700"
            title="Eliminar lista"
          >
            <TrashIcon class="w-4 h-4" />
          </span>
        </button>

        <!-- Quick Add Button in Tabs -->
        <button 
          @click="showCreateModal = true"
          class="px-4 py-3 rounded-lg font-bold bg-[#282828] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
          title="Crear nueva categoría"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="activeCategoryId">
      <div v-if="activeStations.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <div v-for="station in activeStations" :key="station.stationuuid" class="relative group">
            <StationCard :station="station" />
             <button 
                @click="removeFromCategory(station.stationuuid)"
                class="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                title="Eliminar de categoría"
            >
                <TrashIcon class="w-4 h-4" />
            </button>
        </div>
      </div>
      <div v-else class="text-center py-20 bg-[#282828]/30 rounded-lg border border-dashed border-gray-700">
        <p class="text-gray-400 mb-2">Esta categoría está vacía.</p>
        <p class="text-sm text-gray-500">Agrega estaciones desde el Buscador o el Home.</p>
      </div>
    </div>

    <!-- Ad Inline - Categories -->
    <AdInline position="categories" v-if="activeCategoryId" />

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
       <div class="bg-gray-800 p-6 rounded-full mb-4">
          <PlusIcon class="w-12 h-12 text-gray-500" />
       </div>
       <p class="text-gray-400 mb-6">Crea una categoría para organizar tus estaciones.</p>
       <button 
          @click="showCreateModal = true"
          class="px-6 py-3 bg-primary text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
       >
          <PlusIcon class="w-5 h-5" />
          Crear Categoría
       </button>
    </div>
  </div>
</template>
