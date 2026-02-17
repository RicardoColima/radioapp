<script setup>
import AdSenseComponent from './AdSenseComponent.vue';

const props = defineProps({
  position: {
    type: String,
    default: 'middle'
  }
});
</script>

<template>
  <div class="ad-inline-wrapper">
    <AdSenseComponent 
      :ad-slot="`inline-${position}`"
      ad-format="responsive"
      :full-width="true"
      class="my-6"
    />
  </div>
</template>

<style scoped>
.ad-inline-wrapper {
  width: 100%;
  margin: 2rem 0;
}
</style>
