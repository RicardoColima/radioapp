<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import Player from './components/Player.vue';
import CategoryModal from './components/CategoryModal.vue';
import PwaInstallPrompt from './components/PwaInstallPrompt.vue';
import { usePlayerStore } from './stores/player';
import { useStationsStore } from './stores/stations';
import { useSwipe } from '@vueuse/core';

const playerStore = usePlayerStore();
const stationsStore = useStationsStore();
const router = useRouter();
const route = useRoute();
const mainContent = ref(null);
const transitionName = ref('fade');

// Define main navigation tabs in order
const mainTabs = [
  '/',
  '/search',
  '/countries',
  '/favorites',
  '/categories',
  '/random',
  '/acerca'
];

// Scroll to top on route change & Determine transition
watch(() => route.path, (toPath, fromPath) => {
  if (mainContent.value) {
    mainContent.value.scrollTo({ top: 0, behavior: 'auto' });
  }

  const toIndex = mainTabs.indexOf(toPath);
  const fromIndex = mainTabs.indexOf(fromPath);

  if (toIndex !== -1 && fromIndex !== -1) {
    transitionName.value = toIndex > fromIndex ? 'slide-left' : 'slide-right';
  } else {
    transitionName.value = 'fade';
  }
});

// Swipe Navigation
const { direction, isSwiping, lengthX, lengthY } = useSwipe(mainContent, {
  passive: false,
  onSwipeEnd(e, direction) {
    const currentPath = route.path;
    const currentIndex = mainTabs.indexOf(currentPath);
    const swipeThreshold = 50; // Minimum distance to trigger swipe

    // Check if movement is horizontal (horizontal distance > vertical distance)
    const isHorizontalSwipe = Math.abs(lengthX.value) > Math.abs(lengthY.value);

    if (!isHorizontalSwipe) return;

    // If we are on a main tab
    if (currentIndex !== -1) {
       if (direction === 'left' && Math.abs(lengthX.value) > swipeThreshold) {
         // Next Tab
         if (currentIndex < mainTabs.length - 1) {
           router.push(mainTabs[currentIndex + 1]);
         }
       } else if (direction === 'right' && Math.abs(lengthX.value) > swipeThreshold) {
         // Previous Tab
         if (currentIndex > 0) {
           router.push(mainTabs[currentIndex - 1]);
         }
       }
    } else {
      // If NOT on a main tab (e.g. details page), Swipe Right to Go Back
      if (direction === 'right' && lengthX.value < -swipeThreshold) {
         router.back();
      }
    }
  },
});

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
    <main id="main-content" ref="mainContent" class="flex-1 relative h-full overflow-y-auto w-full md:pl-64 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-x-hidden">
      <div class="min-h-full pb-24"> <!-- Padding for bottom player -->
        <RouterView v-slot="{ Component }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>

    <!-- Persistent Player -->
    <Player />
    
    <!-- Global Modals -->
    <CategoryModal />
    <PwaInstallPrompt />
  </div>
</template>

<style>
/* Global resets handled by Tailwind, but ensuring full height */
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Base Transition Classes */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Slide Left (Next Tab) */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Slide Right (Prev Tab) */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Default Fade */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure no horizontal scroll during transition */
main {
  overflow-x: hidden;
}
</style>
