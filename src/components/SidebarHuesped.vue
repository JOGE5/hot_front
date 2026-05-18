<script setup>
import { Home, BedDouble, CalendarCheck, Utensils, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { auth } from '../stores/auth';

const router = useRouter();

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">LM</div>
      <div>
        <h2>La Mansión</h2>
        <p>Panel huésped</p>
      </div>
    </div>

    <nav class="nav">
      <RouterLink to="/panel" class="link">
        <Home size="18" />
        Inicio
      </RouterLink>

      <RouterLink to="/panel/habitaciones" class="link">
        <BedDouble size="18" />
        Habitaciones
      </RouterLink>

      <RouterLink to="/panel/reservaciones" class="link">
        <CalendarCheck size="18" />
        Mis reservaciones
      </RouterLink>

      <RouterLink to="/panel/menu-del-dia" class="link">
        <Utensils size="18" />
        Menú del día
      </RouterLink>
    </nav>

    <button class="logout" @click="logout">
      <LogOut size="18" />
      Cerrar sesión
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 270px;
  min-height: 100vh;
  background: #1f2933;
  color: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 34px;
}

.logo {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #c9a96a;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #1f2933;
}

.brand h2 {
  font-size: 18px;
  margin: 0;
}

.brand p {
  margin: 3px 0 0;
  color: #cbd5e1;
  font-size: 13px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link {
  color: #dbe4ee;
  text-decoration: none;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  transition: 0.2s;
}

.link:hover,
.router-link-exact-active {
  background: rgba(201, 169, 106, 0.18);
  color: #fff;
}

.logout {
  margin-top: auto;
  border: none;
  background: #334155;
  color: #fff;
  padding: 12px 14px;
  border-radius: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
}

.logout:hover {
  background: #475569;
}
</style>