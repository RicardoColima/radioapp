<script setup>
import { ref, computed, watch } from 'vue';
import { useStationsStore } from '../stores/stations';
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import StationCard from '../components/StationCard.vue';

const store = useStationsStore();
store.init();

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
    store.createCategory(newCategoryName.value.trim());
    newCategoryName.value = '';
    showCreateModal.value = false;
    
    // Switch to new category (it's the last one added)
    if (store.categories.length > 0) {
        activeCategoryId.value = store.categories[store.categories.length - 1].id;
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
      <h2 class="text-3xl font-bold text-white">Tu Biblioteca</h2>
      <button 
        @click="showCreateModal = !showCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-full hover:scale-105 transition-transform"
      >
        <PlusIcon class="w-5 h-5" />
        <span class="hidden md:inline">Nueva Categoría</span>
      </button>
    </header>
    
    <!-- Inline Create Form -->
    <div v-if="showCreateModal" class="mb-6 bg-[#282828] p-4 rounded-lg flex gap-2">
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

    <div v-else class="text-center py-20">
       <p class="text-gray-400">Crea una categoría para organizar tus estaciones.</p>
    </div>
  </div>
</template>
