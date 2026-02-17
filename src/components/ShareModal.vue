<script setup>
import { ref, computed } from 'vue';
import { 
  ShareIcon, 
  XMarkIcon, 
  LinkIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SpeakerWaveIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  station: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const copied = ref(false);
const shareUrl = computed(() => {
  const baseUrl = window.location.origin;
  const slug = props.station.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${baseUrl}/station/${slug}-${props.station.stationuuid}`;
});

const shareText = computed(() => {
  return `🎵 Escuchando "${props.station.name}" en RadioApp 📻\n${props.station.tags ? `Género: ${props.station.tags.split(',')[0]}` : ''}\n${props.station.country ? `País: ${props.station.country}` : ''}\n\n¡Descubre más radio mundial! 🌍`;
});

const socialLinks = computed(() => [
  {
    name: 'Facebook',
    icon: 'facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}&quote=${encodeURIComponent(shareText.value)}`
  },
  {
    name: 'X (Twitter)',
    icon: 'x-twitter',
    color: 'bg-black hover:bg-gray-800',
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(shareUrl.value)}`
  },
  {
    name: 'WhatsApp',
    icon: 'whatsapp',
    color: 'bg-green-500 hover:bg-green-600',
    url: `https://wa.me/?text=${encodeURIComponent(shareText.value + ' ' + shareUrl.value)}`
  },
  {
    name: 'Instagram',
    icon: 'instagram',
    color: 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    url: '#', // Instagram doesn't support direct sharing, will copy link
    special: 'instagram'
  },
  {
    name: 'LinkedIn',
    icon: LinkIcon,
    color: 'bg-blue-700 hover:bg-blue-800',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
  },
  {
    name: 'Telegram',
    icon: PaperAirplaneIcon,
    color: 'bg-blue-500 hover:bg-blue-600',
    url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`
  }
]);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

const shareOnSocial = (social) => {
  if (social.special === 'instagram') {
    // Instagram doesn't support direct sharing, so we copy the link
    copyToClipboard();
    // You could also open Instagram with a hint about the link
    window.open('https://www.instagram.com/', '_blank');
  } else {
    window.open(social.url, '_blank', 'width=600,height=400');
  }
};

const nativeShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.station.name,
        text: shareText.value,
        url: shareUrl.value
      });
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  }
};

const hasNativeShare = computed(() => {
  return navigator.share !== undefined;
});

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closeModal"
    >
      <div 
        class="bg-[#181818] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        @click.stop
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <ShareIcon class="w-6 h-6 text-primary" />
            Compartir Estación
          </h3>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-white transition-colors p-1"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Station Info -->
        <div class="bg-[#282828] rounded-lg p-4 mb-6 flex items-center gap-4">
          <img 
            :src="station.favicon || 'https://placehold.co/80x80/282828/FFF?text=R'" 
            :alt="station.name"
            class="w-16 h-16 rounded-lg object-cover"
          />
          <div class="flex-1">
            <h4 class="font-bold text-white mb-1 line-clamp-2">{{ station.name }}</h4>
            <p class="text-sm text-gray-400 line-clamp-1">{{ station.country }}</p>
            <p class="text-xs text-gray-500 line-clamp-1">{{ station.tags?.split(',')[0] || 'Radio' }}</p>
          </div>
        </div>

        <!-- Native Share (Mobile) -->
        <button 
          v-if="hasNativeShare"
          @click="nativeShare"
          class="w-full bg-primary hover:bg-green-600 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <ShareIcon class="w-5 h-5" />
          Compartir
        </button>

        <!-- Social Networks -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button
            v-for="social in socialLinks"
            :key="social.name"
            @click="shareOnSocial(social)"
            :class="[
              'flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-white font-medium',
              social.color
            ]"
          >
            <!-- Custom SVG Icons -->
            <svg v-if="social.icon === 'facebook'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <svg v-else-if="social.icon === 'x-twitter'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <svg v-else-if="social.icon === 'whatsapp'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <svg v-else-if="social.icon === 'instagram'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069 3.204 0 3.584.013 4.85.069 3.252.148 4.77 1.691 4.918 4.919.058 1.265.07 1.645.07 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07zm0-2.163c-3.259 0-3.667.014-4.947.072-2.358.129-3.588 1.376-3.717 3.73-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.129 2.354 1.359 3.601 3.717 3.73 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 2.354-.129 3.588-1.376 3.717-3.73.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.129-2.354-1.357-3.601-3.717-3.73-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
            </svg>
            <component v-else :is="social.icon" class="w-5 h-5" />
            <span class="text-sm">{{ social.name }}</span>
          </button>
        </div>

        <!-- Copy Link -->
        <div class="border-t border-gray-700 pt-4">
          <div class="flex items-center gap-2 mb-3">
            <LinkIcon class="w-5 h-5 text-gray-400" />
            <span class="text-sm text-gray-400">Enlace directo</span>
          </div>
          <div class="flex gap-2">
            <input 
              :value="shareUrl"
              readonly
              class="flex-1 bg-[#282828] text-white px-3 py-2 rounded-lg text-sm border border-gray-600"
            />
            <button 
              @click="copyToClipboard"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
              {{ copied ? '¡Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Preview Text -->
        <div class="mt-4 p-3 bg-[#282828] rounded-lg">
          <p class="text-xs text-gray-400 mb-1">Vista previa del mensaje:</p>
          <p class="text-sm text-gray-300 whitespace-pre-line">{{ shareText }}</p>
          <p class="text-xs text-primary mt-2 break-all">{{ shareUrl }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}
</style>
