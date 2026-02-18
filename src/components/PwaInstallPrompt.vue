<script setup>
import { ref, onMounted } from 'vue';
import { XMarkIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/vue/24/outline';

const deferredPrompt = ref(null);
const showInstallPrompt = ref(false);
const isIOS = ref(false);

onMounted(() => {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // Detect iOS
  const userAgent = window.navigator.userAgent.toLowerCase();
  isIOS.value = /iphone|ipad|ipod/.test(userAgent);

  // Handle standard install prompt (Android/Desktop)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallPrompt.value = true;
  });

  // For iOS, show prompt after a delay if not in standalone mode
  if (isIOS.value) {
    setTimeout(() => {
        showInstallPrompt.value = true;
    }, 3000);
  }
});

const installPWA = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === 'accepted') {
      showInstallPrompt.value = false;
    }
    deferredPrompt.value = null;
  }
};

const dismissPrompt = () => {
  showInstallPrompt.value = false;
};
</script>

<template>
  <div v-if="showInstallPrompt" class="fixed bottom-20 left-4 right-4 md:bottom-4 md:right-4 md:left-auto md:w-96 z-50 animate-slide-up">
    <div class="bg-[#282828] border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col gap-3">
      <div class="flex justify-between items-start">
        <div class="flex gap-3 items-center">
          <div class="bg-[#1DB954] p-2 rounded-lg">
            <img src="/logo.svg" class="w-8 h-8" alt="Logo" />
          </div>
          <div>
            <h3 class="font-bold text-white">Instalar RadioApp</h3>
            <p class="text-xs text-gray-400">Acceso rápido y sin conexión</p>
          </div>
        </div>
        <button @click="dismissPrompt" class="text-gray-400 hover:text-white p-1">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Android / Desktop Button -->
      <button 
        v-if="!isIOS"
        @click="installPWA"
        class="w-full py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors flex items-center justify-center gap-2"
      >
        <ArrowDownTrayIcon class="w-5 h-5" />
        Instalar Aplicación
      </button>

      <!-- iOS Instructions -->
      <div v-else class="bg-[#181818] p-3 rounded-lg text-sm text-gray-300">
        <p class="mb-2">Para instalar en iOS:</p>
        <ol class="list-decimal list-inside space-y-1 text-xs text-gray-400">
          <li class="flex items-center gap-1">Toca el botón <ShareIcon class="w-4 h-4 inline text-blue-500" /> compartir</li>
          <li>Selecciona "Agregar a inicio"</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
