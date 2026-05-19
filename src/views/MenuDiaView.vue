<script setup>
import { computed, onMounted, ref } from 'vue';
import { Utensils } from 'lucide-vue-next';
import api from '../api/axios';

const menu = ref([]);
const loading = ref(true);
const error = ref('');

const groups = ['Desayuno', 'Almuerzo', 'Cena', 'Especial del día'];

function normalizeMenu(payload) {
  const data = payload?.data || payload?.menu || payload || [];

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).flatMap(([category, items]) => {
      const list = Array.isArray(items) ? items : [items].filter(Boolean);
      return list.map((item) => ({ ...item, categoria: item.categoria || category }));
    });
  }

  return [];
}

const groupedMenu = computed(() => {
  return groups.map((group) => ({
    name: group,
    items: menu.value.filter((item) => {
      const category = String(item.categoria || item.tipo || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const expected = group
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return category === expected;
    }),
  }));
});

function formatMoney(value) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

async function fetchMenu() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/huesped/menu-del-dia');
    menu.value = normalizeMenu(response.data);
  } catch (err) {
    error.value = err.response?.data?.message || 'No pudimos cargar el menú del día.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchMenu);
</script>

<template>
  <section class="menu-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Gastronomía</p>
        <h2>Menú del día</h2>
        <p>Propuesta publicada para huéspedes de Hotel La Mansión.</p>
      </div>
      <div class="head-icon">
        <Utensils :size="24" />
      </div>
    </div>

    <div v-if="loading" class="state-card">Cargando menú...</div>
    <p v-else-if="error" class="message error">{{ error }}</p>
    <div v-else-if="menu.length === 0" class="state-card">Aún no hay menú publicado para hoy.</div>

    <div v-else class="menu-groups">
      <section v-for="group in groupedMenu" :key="group.name" class="menu-group">
        <div class="group-title">
          <h3>{{ group.name }}</h3>
          <span>{{ group.items.length }} opciones</span>
        </div>

        <div v-if="group.items.length === 0" class="empty-group">
          Sin platos publicados en esta categoría.
        </div>

        <div v-else class="dish-grid">
          <article v-for="dish in group.items" :key="dish.id || dish.nombre" class="dish-card">
            <div class="dish-image">
              <img v-if="dish.imagen_url || dish.imagen" :src="dish.imagen_url || dish.imagen" :alt="dish.nombre" />
              <Utensils v-else :size="28" />
            </div>
            <div class="dish-body">
              <span class="category">{{ dish.categoria || group.name }}</span>
              <h4>{{ dish.nombre || 'Plato del día' }}</h4>
              <p>{{ dish.descripcion || 'Preparación seleccionada por la cocina del hotel.' }}</p>
              <strong>{{ formatMoney(dish.precio) }}</strong>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.menu-page {
  display: grid;
  gap: 20px;
}

.page-head,
.menu-group,
.state-card,
.message {
  border-radius: var(--hotel-radius);
  background: #fff;
  border: 1px solid rgba(230, 223, 210, 0.82);
  box-shadow: var(--hotel-shadow-soft);
}

.page-head {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.eyebrow {
  margin-bottom: 8px;
  color: #9a6b2f;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-head h2 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
}

.page-head p {
  margin: 0;
  color: var(--hotel-muted);
}

.head-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--hotel-gold-soft);
  color: #8a5d1f;
}

.state-card,
.message {
  padding: 16px;
  color: var(--hotel-muted);
  font-weight: 700;
}

.message.error {
  background: #fff0ed;
  color: #b42318;
}

.menu-groups {
  display: grid;
  gap: 18px;
}

.menu-group {
  padding: 22px;
}

.group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.group-title h3 {
  margin: 0;
  color: var(--hotel-ink);
}

.group-title span {
  color: var(--hotel-muted);
  font-size: 13px;
  font-weight: 800;
}

.empty-group {
  padding: 14px;
  border-radius: 8px;
  background: #fbf8f1;
  color: var(--hotel-muted);
  font-weight: 700;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dish-card {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--hotel-border);
  background: #fff;
}

.dish-image {
  height: 128px;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(201, 169, 106, 0.76), rgba(111, 143, 114, 0.76)),
    url('../assets/hero.png') center / cover;
  color: #fff;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-body {
  padding: 16px;
}

.category {
  display: inline-flex;
  margin-bottom: 9px;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
  font-size: 12px;
  font-weight: 900;
}

.dish-body h4 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
  font-size: 17px;
}

.dish-body p {
  min-height: 44px;
  margin: 0 0 12px;
  color: var(--hotel-muted);
  line-height: 1.5;
}

.dish-body strong {
  color: #8a5d1f;
}

@media (max-width: 1050px) {
  .dish-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .page-head,
  .group-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .dish-grid {
    grid-template-columns: 1fr;
  }
}
</style>
