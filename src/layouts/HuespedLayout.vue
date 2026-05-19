<script setup>
import { computed, ref } from 'vue';
import { Search } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import SidebarHuesped from '../components/SidebarHuesped.vue';

const route = useRoute();
const router = useRouter();
const searchTerm = ref('');
const searchFeedback = ref('');

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Inicio',
    habitaciones: 'Habitaciones',
    reservaciones: 'Mis reservaciones',
    'crear-reservacion': 'Nueva reservación',
    'menu-dia': 'Menú del día',
    perfil: 'Mi perfil',
    'puntos-turisticos': 'Puntos turísticos',
  };

  return titles[route.name] || 'Panel huésped';
});

function normalizeSearch(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function handleSearch() {
  const value = normalizeSearch(searchTerm.value);
  searchFeedback.value = '';

  if (!value) {
    searchFeedback.value = 'Escribe una sección para buscar.';
    return;
  }

  if (value.includes('habitacion')) {
    router.push('/panel/habitaciones');
    searchTerm.value = '';
    return;
  }

  if (value.includes('reserva') || value.includes('reservacion')) {
    router.push('/panel/reservaciones');
    searchTerm.value = '';
    return;
  }

  if (value.includes('menu')) {
    router.push('/panel/menu-del-dia');
    searchTerm.value = '';
    return;
  }

  if (
    value.includes('turismo') ||
    value.includes('sorata') ||
    value.includes('punto') ||
    value.includes('puntos')
  ) {
    router.push('/panel/puntos-turisticos');
    searchTerm.value = '';
    return;
  }

  searchFeedback.value = 'No se encontró una sección relacionada.';
}
</script>

<template>
  <div class="guest-layout">
    <SidebarHuesped />

    <div class="main-shell">
      <header class="topbar">
        <div>
          <p class="topbar-kicker">Hotel La Mansión</p>
          <h1>{{ pageTitle }}</h1>
        </div>

        <div class="topbar-actions">
          <form class="search-box" aria-label="Buscar sección" @submit.prevent="handleSearch">
            <Search :size="17" />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar servicios"
              aria-label="Buscar servicios"
            />
          </form>
          <RouterLink class="avatar" to="/panel/perfil" aria-label="Ir a mi perfil">H</RouterLink>
        </div>
      </header>

      <p v-if="searchFeedback" class="search-feedback">{{ searchFeedback }}</p>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.guest-layout {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(circle at top right, rgba(201, 169, 106, 0.18), transparent 30%),
    var(--hotel-bg);
}

.main-shell {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  min-height: 86px;
  padding: 22px 32px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.topbar-kicker {
  margin-bottom: 4px;
  color: #9a6b2f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.topbar h1 {
  margin: 0;
  color: var(--hotel-ink);
  font-size: 28px;
  line-height: 1.1;
  font-weight: 800;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.search-box {
  min-width: 260px;
  height: 42px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  color: #8a8173;
  box-shadow: 0 8px 20px rgba(31, 41, 51, 0.05);
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--hotel-ink);
}

.search-box input::placeholder {
  color: #8a8173;
}

.avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--hotel-gold), #f1dca9);
  color: var(--hotel-ink);
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(154, 107, 47, 0.22);
}

.search-feedback {
  align-self: flex-end;
  margin: -4px 32px 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff8e8;
  color: #8a5d1f;
  font-size: 13px;
  font-weight: 700;
}

.content {
  flex: 1;
  width: 100%;
  padding: 10px 32px 32px;
}

@media (max-width: 920px) {
  .guest-layout {
    flex-direction: column;
  }

  .topbar {
    padding: 18px 18px 10px;
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-actions,
  .search-box {
    width: 100%;
  }

  .search-box {
    min-width: 0;
  }

  .search-feedback {
    align-self: stretch;
    margin: 0 18px 8px;
  }

  .content {
    padding: 10px 18px 24px;
  }
}
</style>
