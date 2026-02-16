<script setup>
import { ref, watch } from 'vue';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '¿Qué quieres escuchar?'
  }
});

const emit = defineEmits(['update:modelValue', 'search']);

const query = ref(props.modelValue);

// Debounce the input to avoid too many API calls
const debouncedSearch = useDebounceFn(() => {
  emit('update:modelValue', query.value);
  emit('search', query.value);
}, 500);

const onInput = () => {
  debouncedSearch();
};
</script>

<template>
  <div class="relative w-full max-w-md">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
    </div>
    <input 
      v-model="query"
      @input="onInput"
      type="text" 
      class="block w-full p-3 pl-10 text-sm text-white bg-white/10 border border-transparent rounded-full focus:ring-2 focus:ring-primary focus:bg-white/20 placeholder-gray-400 outline-none transition-all" 
      :placeholder="placeholder" 
    />
  </div>
</template>
