import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SearchView from '../views/SearchView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import CategoriesView from '../views/CategoriesView.vue';
import StationDetailView from '../views/StationDetailView.vue';
import AboutView from '../views/AboutView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView
    },
    {
      path: '/countries',
      name: 'countries',
      component: () => import('../views/CountriesView.vue')
    },
    {
      path: '/station/:id',
      name: 'station-detail',
      component: StationDetailView
    },
    {
      path: '/acerca',
      name: 'about',
      component: AboutView
    },
    {
      path: '/country/:name',
      name: 'country-stations',
      component: () => import('../views/CountryStationsView.vue')
    },
    {
      path: '/random',
      name: 'random',
      component: () => import('../views/RandomView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

export default router;
