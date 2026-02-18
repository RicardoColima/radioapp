<script setup>
defineProps({
  type: {
    type: String,
    default: 'card', // card, text, circle, rectangle
    validator: (value) => ['card', 'text', 'circle', 'rectangle', 'list-item'].includes(value)
  },
  count: {
    type: Number,
    default: 1
  },
  height: {
    type: String,
    default: 'h-4'
  },
  width: {
    type: String,
    default: 'w-full'
  }
});
</script>

<template>
  <div v-if="count === 1" :class="['animate-pulse bg-[#282828] rounded', height, width, {
    'rounded-full': type === 'circle',
    'rounded-lg': type === 'card' || type === 'rectangle'
  }]">
    <!-- Card Specific Structure -->
    <div v-if="type === 'card'" class="h-full flex flex-col p-3">
      <div class="flex-1 bg-[#333] rounded-md mb-3 w-full h-24"></div>
      <div class="h-4 bg-[#333] rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-[#333] rounded w-1/2"></div>
    </div>

    <!-- List Item Specific Structure -->
    <div v-if="type === 'list-item'" class="flex items-center gap-3 p-2">
      <div class="w-12 h-12 bg-[#333] rounded-md flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-[#333] rounded w-3/4"></div>
        <div class="h-3 bg-[#333] rounded w-1/2"></div>
      </div>
    </div>
  </div>

  <div v-else class="grid gap-4" :class="{
    'grid-cols-2 md:grid-cols-4 lg:grid-cols-6': type === 'card'
  }">
    <div v-for="n in count" :key="n" :class="['animate-pulse bg-[#282828] rounded', height, width, {
      'rounded-full': type === 'circle',
      'rounded-lg': type === 'card' || type === 'rectangle',
      'h-48': type === 'card' // Default height for cards in grid
    }]">
      <!-- Card Specific Structure Loop -->
      <div v-if="type === 'card'" class="h-full flex flex-col p-3">
        <div class="flex-1 bg-[#333] rounded-md mb-3 w-full"></div>
        <div class="h-4 bg-[#333] rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-[#333] rounded w-1/2"></div>
      </div>

      <!-- List Item Specific Structure Loop -->
      <div v-if="type === 'list-item'" class="flex items-center gap-3 p-2">
        <div class="w-12 h-12 bg-[#333] rounded-md flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-[#333] rounded w-3/4"></div>
          <div class="h-3 bg-[#333] rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
</template>
