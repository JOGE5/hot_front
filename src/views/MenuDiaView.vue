<script setup>
import { computed, onMounted, ref } from 'vue';
import { Utensils } from 'lucide-vue-next';
import api from '../api/axios';

const menus = ref([]);
const loading = ref(true);
const error = ref('');

function normalizeMenu(payload) {
  const data = payload?.data || payload?.menus || payload || [];

  if (Array.isArray(data)) {
    const hasMenuShape = data.some((menuItem) => Array.isArray(menuItem?.platos));

    if (!hasMenuShape) {
      return [
        {
          tipo_menu: 'Menú del día',
          platos: data,
        },
      ];
    }

    return data.map((menuItem) => ({
      ...menuItem,
      platos: Array.isArray(menuItem?.platos) ? menuItem.platos : [],
    }));
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).map(([tipoMenu, items]) => ({
      tipo_menu: tipoMenu,
      platos: Array.isArray(items) ? items : [items].filter(Boolean),
    }));
  }

  return [];
}

const groupedMenus = computed(() => {
  return menus.value.map((menuItem) => ({
    ...menuItem,
    platos: [...(menuItem.platos || [])].sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0)),
  }));
});

function formatMoney(value) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'Fecha no registrada';

  return new Date(`${value}T00:00:00`).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function resolveImage(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const apiOrigin = new URL(api.defaults.baseURL).origin;
  const cleanPath = String(path).replace(/^\/+/, '').replace(/^storage\//, '');
  return `${apiOrigin}/storage/${cleanPath}`;
}

async function fetchMenu() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/huesped/menu-del-dia');
    menus.value = normalizeMenu(response.data);
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
    <div v-else-if="menus.length === 0" class="state-card">Aún no hay menú publicado para hoy.</div>

    <div v-else class="menu-groups">
      <section
        v-for="menuItem in groupedMenus"
        :key="menuItem.id || `${menuItem.tipo_menu}-${menuItem.fecha_menu}`"
        class="menu-group"
      >
        <div class="group-title">
          <div>
            <h3>{{ menuItem.tipo_menu || 'Menú del día' }}</h3>
            <p>{{ formatDate(menuItem.fecha_menu) }}</p>
          </div>
          <span>{{ menuItem.platos.length }} opciones</span>
        </div>

        <div v-if="menuItem.platos.length === 0" class="empty-group">
          Sin platos publicados en este menú.
        </div>

        <div v-else class="dish-grid">
          <article v-for="dish in menuItem.platos" :key="dish.id || dish.nombre" class="dish-card">
            <div class="dish-image">
              <img
                v-if="resolveImage(dish.imagen_url || dish.imagen)"
                :src="resolveImage(dish.imagen_url || dish.imagen)"
                :alt="dish.nombre"
              />
              <Utensils v-else :size="28" />
            </div>
            <div class="dish-body">
              <div class="dish-meta">
                <span class="category">{{ dish.categoria || 'Sin categoría' }}</span>
                <span v-if="dish.estado" class="status">{{ dish.estado }}</span>
              </div>
              <h4>{{ dish.nombre || 'Plato del día' }}</h4>
              <p>{{ dish.descripcion || 'Preparación seleccionada por la cocina del hotel.' }}</p>
              <div class="dish-footer">
                <strong>{{ formatMoney(dish.precio) }}</strong>
                <span v-if="dish.tiempo_preparacion" class="prep-time">
                  {{ dish.tiempo_preparacion }}
                </span>
              </div>
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

.group-title p {
  margin: 5px 0 0;
  color: var(--hotel-muted);
  font-size: 14px;
  font-weight: 700;
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

.dish-meta,
.dish-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.dish-meta {
  flex-wrap: wrap;
  margin-bottom: 9px;
}

.category {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
  font-size: 12px;
  font-weight: 900;
}

.status,
.prep-time {
  color: var(--hotel-muted);
  font-size: 12px;
  font-weight: 900;
}

.status {
  padding: 5px 9px;
  border-radius: 999px;
  background: #fbf8f1;
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

.prep-time {
  white-space: nowrap;
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
