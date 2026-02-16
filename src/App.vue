<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';
import Player from './components/Player.vue';
import CategoryModal from './components/CategoryModal.vue';
import { usePlayerStore } from './stores/player';
import { useStationsStore } from './stores/stations';

const playerStore = usePlayerStore();
const stationsStore = useStationsStore();

onMounted(() => {
  playerStore.init();
  stationsStore.init();
});
</script>

<template>
  <div class="flex h-screen bg-black text-white overflow-hidden">
    <!-- Navigation -->
    <NavBar />

    <!-- Main Content Area -->
    <main class="flex-1 relative h-full overflow-y-auto w-full md:pl-64 bg-gradient-to-b from-[#1e1e1e] to-[#121212]">
      <div class="min-h-full pb-24"> <!-- Padding for bottom player -->
        <RouterView />
      </div>
    </main>

    <!-- Persistent Player -->
    <Player />
    
    <!-- Global Modals -->
    <CategoryModal />
  </div>
</template>

<style>
/* Global resets handled by Tailwind, but ensuring full height */
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Entrance Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.stagger-item {
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
