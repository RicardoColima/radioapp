<script setup>
import AdSenseComponent from './AdSenseComponent.vue';
</script>

<template>
  <div class="ad-banner-wrapper">
    <AdSenseComponent 
      ad-slot="banner-top"
      ad-format="horizontal"
      :full-width="true"
      class="my-4"
    />
  </div>
</template>

<style scoped>
.ad-banner-wrapper {
  width: 100%;
}
</style>
