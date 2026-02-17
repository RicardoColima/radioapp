<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  adSlot: {
    type: String,
    required: true
  },
  adFormat: {
    type: String,
    default: 'auto'
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

const adLoaded = ref(false);
const adError = ref(false);

onMounted(() => {
  try {
    // Simulación de AdSense (en producción sería el código real de Google)
    // Esto es solo para demostrar dónde irían los anuncios
    
    // En producción real, usarías:
    // (window.adsbygoogle = window.adsbygoogle || []).push({});
    
    // Simulamos carga exitosa después de 1 segundo
    setTimeout(() => {
      adLoaded.value = true;
    }, 1000);
    
  } catch (error) {
    console.error('Error loading ad:', error);
    adError.value = true;
  }
});
</script>

<template>
  <div 
    :class="[
      'ad-container',
      fullWidth ? 'w-full' : 'max-w-sm mx-auto',
      className
    ]"
  >
    <!-- Contenedor del anuncio (simulado) -->
    <div 
      v-if="!adError"
      class="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center min-h-[90px] relative"
    >
      <!-- Simulación de anuncio de Google AdSense -->
      <div v-if="!adLoaded" class="text-gray-500 text-sm">
        <div class="animate-pulse flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-gray-600 rounded"></div>
          <span>Cargando anuncio...</span>
        </div>
      </div>
      
      <div v-else class="text-center p-4">
        <!-- Simulación visual de un anuncio -->
        <div class="text-xs text-gray-400 mb-2">Publicidad</div>
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded text-sm font-medium">
          📻 Descubre más música
        </div>
        <div class="text-xs text-gray-500 mt-2">
          radioapp.example
        </div>
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <div v-else class="bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center text-gray-500 text-sm">
      Anuncio no disponible
    </div>
  </div>
</template>

<style scoped>
.ad-container {
  margin: 1rem 0;
}

/* En producción, Google AdSense inyectaría sus propios estilos */
/* Estos son solo para la simulación */
</style>
