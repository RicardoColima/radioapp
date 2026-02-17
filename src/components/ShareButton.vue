<script setup>
import { ref } from 'vue';
import { ShareIcon } from '@heroicons/vue/24/outline';
import ShareModal from './ShareModal.vue';

const props = defineProps({
  station: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  }
});

const showShareModal = ref(false);

const openShareModal = () => {
  showShareModal.value = true;
};

const closeShareModal = () => {
  showShareModal.value = false;
};

const sizeClasses = {
  small: 'p-1.5',
  normal: 'p-2',
  large: 'p-3'
};

const iconSizes = {
  small: 'w-4 h-4',
  normal: 'w-5 h-5',
  large: 'w-6 h-6'
};
</script>

<template>
  <div>
    <button
      @click="openShareModal"
      :class="[
        'text-gray-400 hover:text-white transition-colors rounded-full border border-gray-500 hover:border-white',
        sizeClasses[size]
      ]"
      title="Compartir estación"
    >
      <ShareIcon :class="iconSizes[size]" />
    </button>

    <ShareModal
      :station="station"
      :show="showShareModal"
      @close="closeShareModal"
    />
  </div>
</template>
