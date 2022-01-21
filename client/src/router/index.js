import { createWebHistory, createRouter } from 'vue-router';
import store from '@/store'

import Main from '@/pages/Main.vue';

const routes = [
  {
    path: '/',
    component: Main,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

