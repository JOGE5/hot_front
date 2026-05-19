<script setup>
import { ref } from 'vue';
import { Home, BedDouble, CalendarCheck, Utensils, MapPinned, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { auth } from '../stores/auth';
import logoUrl from '../assets/logo-la-mansion.png.png';

const router = useRouter();
const logoFailed = ref(false);

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-overlay"></div>

    <div class="sidebar-content">
      <div class="brand">
        <img
          v-if="!logoFailed"
          class="brand-logo"
          :src="logoUrl"
          alt="Hotel La Mansión"
          @error="logoFailed = true"
        />
        <span v-else class="brand-fallback">LM</span>
        <p>Panel huésped</p>
      </div>

      <nav class="nav" aria-label="Navegación huésped">
        <RouterLink to="/panel" class="link">
          <Home :size="18" />
          <span>Inicio</span>
        </RouterLink>

        <RouterLink to="/panel/habitaciones" class="link">
          <BedDouble :size="18" />
          <span>Habitaciones</span>
        </RouterLink>

        <RouterLink to="/panel/reservaciones" class="link">
          <CalendarCheck :size="18" />
          <span>Mis reservaciones</span>
        </RouterLink>

        <RouterLink to="/panel/menu-del-dia" class="link">
          <Utensils :size="18" />
          <span>Menú del día</span>
        </RouterLink>

        <RouterLink to="/panel/puntos-turisticos" class="link">
          <MapPinned :size="18" />
          <span>Puntos turísticos</span>
        </RouterLink>
      </nav>

      <button class="logout" type="button" @click="logout">
        <LogOut :size="18" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  width: 260px;
  min-width: 260px;
  height: 100vh;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(145deg, rgba(31, 41, 51, 0.92), rgba(21, 27, 32, 0.96)),
    url('../assets/hero.png') center / cover;
  box-shadow: 8px 0 28px rgba(31, 41, 51, 0.2);
}

.sidebar-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(14, 18, 22, 0.45), rgba(14, 18, 22, 0.88)),
    radial-gradient(circle at 20% 0%, rgba(201, 169, 106, 0.34), transparent 34%);
}

.sidebar-content {
  position: relative;
  z-index: 1;
  min-height: 100%;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 4px 6px 20px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.brand-logo {
  width: 170px;
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.brand p {
  margin: 0;
  color: #d6dfd4;
  font-size: 13px;
  font-weight: 600;
}

.brand-fallback {
  width: 170px;
  max-width: 100%;
  color: var(--hotel-gold);
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.08em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link,
.logout {
  width: 100%;
  min-height: 46px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.84);
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.link svg,
.logout svg {
  flex: 0 0 auto;
}

.link:hover,
.router-link-exact-active {
  background: linear-gradient(135deg, rgba(111, 143, 114, 0.95), rgba(201, 169, 106, 0.82));
  color: #fff;
  transform: translateX(2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}

.logout {
  margin-top: auto;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.logout:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

@media (max-width: 920px) {
  .sidebar {
    position: relative;
    width: 100%;
    min-width: 0;
    height: auto;
  }

  .sidebar-content {
    min-height: auto;
    padding: 18px;
  }

  .brand {
    padding-bottom: 16px;
  }

  .nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .logout {
    margin-top: 12px;
  }
}

@media (max-width: 560px) {
  .nav {
    grid-template-columns: 1fr;
  }
}
</style>
