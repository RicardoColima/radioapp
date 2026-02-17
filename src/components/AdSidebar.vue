<script setup>
import AdSenseComponent from './AdSenseComponent.vue';
</script>

<template>
  <div class="ad-sidebar-wrapper">
    <AdSenseComponent 
      ad-slot="sidebar-vertical"
      ad-format="vertical"
      :full-width="false"
      class="sticky top-6"
    />
  </div>
</template>

<style scoped>
.ad-sidebar-wrapper {
  width: 100%;
  max-width: 300px;
}
</style>
