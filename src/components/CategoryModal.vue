<script setup>
import { ref } from 'vue';
import { useStationsStore } from '../stores/stations';
import { XMarkIcon, PlusIcon } from '@heroicons/vue/24/outline';

const store = useStationsStore();
const newCategoryName = ref('');
const showCreateInput = ref(false);

const close = () => {
  store.closeAddModal();
  newCategoryName.value = '';
  showCreateInput.value = false;
};

const addToCategory = (categoryId) => {
  if (store.addingStation) {
    store.addToCategory(categoryId, store.addingStation);
    close();
  }
};

const createAndAdd = () => {
  if (newCategoryName.value.trim()) {
    store.createCategory(newCategoryName.value.trim());
    // Get the newly created category (last one)
    const newCat = store.categories[store.categories.length - 1];
    if (newCat && store.addingStation) {
      store.addToCategory(newCat.id, store.addingStation);
    }
    close();
  }
};
</script>

<template>
  <div v-if="store.showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close"></div>
    
    <div class="relative bg-[#282828] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-fade-in">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-bold text-white">Guardar en lista</h3>
        <button @click="close" class="text-gray-400 hover:text-white">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 max-h-[60vh] overflow-y-auto">
        <div v-if="store.categories.length > 0" class="space-y-2">
          <button 
            v-for="cat in store.categories" 
            :key="cat.id"
            @click="addToCategory(cat.id)"
            class="w-full p-3 bg-[#181818] hover:bg-[#333] rounded-lg text-left text-white transition-colors flex items-center justify-between group"
          >
            <span>{{ cat.name }}</span>
            <span v-if="cat.stations.some(s => s.stationuuid === store.addingStation?.stationuuid)" class="text-xs text-green-500 font-medium">
              Ya agregado
            </span>
            <PlusIcon v-else class="w-5 h-5 text-gray-500 group-hover:text-white" />
          </button>
        </div>
        <div v-else class="text-center text-gray-400 py-4">
          No tienes listas creadas.
        </div>
      </div>

      <!-- Footer / Create -->
      <div class="p-4 border-t border-gray-700 bg-[#222]">
        <div v-if="showCreateInput" class="flex gap-2">
          <input 
            v-model="newCategoryName"
            @keyup.enter="createAndAdd"
            type="text" 
            placeholder="Nombre de la lista..." 
            class="flex-1 bg-[#181818] text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 outline-none text-sm"
            autoFocus
          />
          <button 
            @click="createAndAdd"
            class="px-4 py-2 bg-green-500 text-black font-bold rounded text-sm hover:bg-green-400"
          >
            Crear
          </button>
        </div>
        <button 
          v-else
          @click="showCreateInput = true"
          class="flex items-center gap-2 text-green-500 hover:text-green-400 font-medium text-sm"
        >
          <PlusIcon class="w-5 h-5" />
          Nueva lista
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
