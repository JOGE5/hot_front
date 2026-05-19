import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../stores/auth';

import LoginView from '../views/LoginView.vue';
import HuespedLayout from '../layouts/HuespedLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import HabitacionesView from '../views/HabitacionesView.vue';
import ReservacionesView from '../views/ReservacionesView.vue';
import CrearReservacionView from '../views/CrearReservacionView.vue';
import MenuDiaView from '../views/MenuDiaView.vue';
import PerfilView from '../views/PerfilView.vue';
import PuntosTuristicosView from '../views/PuntosTuristicosView.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/panel',
    component: HuespedLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
      },
      {
        path: 'habitaciones',
        name: 'habitaciones',
        component: HabitacionesView,
      },
      {
        path: 'reservaciones',
        name: 'reservaciones',
        component: ReservacionesView,
      },
      {
        path: 'reservar',
        name: 'crear-reservacion',
        component: CrearReservacionView,
      },
      {
        path: 'menu-del-dia',
        name: 'menu-dia',
        component: MenuDiaView,
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: PerfilView,
      },
      {
        path: 'puntos-turisticos',
        name: 'puntos-turisticos',
        component: PuntosTuristicosView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated()) {
    return '/login';
  }

  if (to.name === 'login' && auth.isAuthenticated()) {
    return '/panel';
  }
});

export default router;
