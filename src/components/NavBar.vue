<script setup>
import { useRoute } from 'vue-router';
import { HomeIcon, MagnifyingGlassIcon, HeartIcon, TagIcon, InformationCircleIcon, GlobeAmericasIcon, SparklesIcon } from '@heroicons/vue/24/outline';
import { HomeIcon as HomeSolid, MagnifyingGlassIcon as SearchSolid, HeartIcon as HeartSolid, TagIcon as TagSolid, InformationCircleIcon as InfoSolid, GlobeAmericasIcon as GlobeSolid, SparklesIcon as SparklesSolid } from '@heroicons/vue/24/solid';

const route = useRoute();

const navItems = [
  { name: 'Inicio', path: '/', icon: HomeIcon, activeIcon: HomeSolid },
  { name: 'Buscar', path: '/search', icon: MagnifyingGlassIcon, activeIcon: SearchSolid },
  { name: 'Países', path: '/countries', icon: GlobeAmericasIcon, activeIcon: GlobeSolid },
  { name: 'Favoritos', path: '/favorites', icon: HeartIcon, activeIcon: HeartSolid },
  { name: 'Categorías', path: '/categories', icon: TagIcon, activeIcon: TagSolid },
  { name: 'Aleatorio', path: '/random', icon: SparklesIcon, activeIcon: SparklesSolid },
  { name: 'Acerca de', path: '/acerca', icon: InformationCircleIcon, activeIcon: InfoSolid },
];
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside class="hidden md:flex flex-col w-64 h-screen bg-black text-white p-6 fixed left-0 top-0 z-40 border-r border-gray-900">
    <div class="flex items-center gap-2 mb-10 px-2">
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <span class="font-bold text-black text-xl">R</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight">RadioApp</h1>
    </div>

    <nav class="flex-1 space-y-2">
      <router-link 
        v-for="item in navItems" 
        :key="item.name" 
        :to="item.path"
        class="flex items-center gap-4 px-4 py-3 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-white/10"
        :class="{ '!text-white !bg-white/10 font-medium': route.path === item.path }"
      >
        <component :is="route.path === item.path ? item.activeIcon : item.icon" class="w-6 h-6 text-primary" />
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
    
    <div class="mt-auto pt-6 border-t border-gray-800 text-xs text-gray-500">
      <p>Potenciado por Radio Browser API</p>
    </div>
  </aside>

  <!-- Mobile Bottom Nav -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-black/95 backdrop-blur-lg border-t border-gray-800 z-50 flex justify-around items-center px-2 pb-safe">
    <router-link 
      v-for="item in navItems" 
      :key="item.name" 
      :to="item.path"
      class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-white"
      :class="{ '!text-white': route.path === item.path }"
    >
      <component :is="route.path === item.path ? item.activeIcon : item.icon" class="w-6 h-6 mb-1 text-primary" />
      <span class="text-[10px]">{{ item.name }}</span>
    </router-link>
  </nav>
</template>
