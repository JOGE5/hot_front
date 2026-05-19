<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  BedDouble,
  CalendarCheck,
  Utensils,
  ArrowRight,
  Sparkles,
  MapPinned,
} from 'lucide-vue-next';
import api from '../api/axios';

const loading = ref(true);
const error = ref('');
const dashboard = ref(null);

const summaryCards = [
  {
    title: 'Habitaciones',
    text: 'Consulta disponibilidad, tipos de habitación y tarifas publicadas.',
    to: '/panel/habitaciones',
    icon: BedDouble,
    tone: 'green',
  },
  {
    title: 'Mis reservaciones',
    text: 'Revisa el estado de tus estadías y solicitudes registradas.',
    to: '/panel/reservaciones',
    icon: CalendarCheck,
    tone: 'gold',
  },
  {
    title: 'Menú del día',
    text: 'Explora la propuesta gastronómica disponible durante tu visita.',
    to: '/panel/menu-del-dia',
    icon: Utensils,
    tone: 'ink',
  },
  {
    title: 'Puntos turísticos',
    text: 'Descubre recomendaciones cercanas para disfrutar Sorata.',
    to: '/panel/puntos-turisticos',
    icon: MapPinned,
    tone: 'green',
  },
];

const guestName = computed(() => {
  const fromDashboard = dashboard.value?.huesped?.nombres || dashboard.value?.nombre_huesped;

  if (fromDashboard) {
    return fromDashboard;
  }

  try {
    const huesped = JSON.parse(localStorage.getItem('huesped') || 'null');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return huesped?.nombres || user?.name || user?.email || 'huésped';
  } catch {
    return 'huésped';
  }
});

const totalReservaciones = computed(() => dashboard.value?.total_reservaciones ?? 'Pendiente');
const reservacionesActivas = computed(() => dashboard.value?.reservaciones_activas ?? 'Pendiente');
const ultimasReservaciones = computed(() => {
  return dashboard.value?.ultimas_reservaciones || dashboard.value?.reservaciones_recientes || [];
});

function formatDate(value) {
  if (!value) return 'No registrado';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  try {
    const response = await api.get('/huesped/dashboard');
    dashboard.value = response.data?.data || response.data;
  } catch {
    error.value = 'No pudimos cargar el resumen en este momento. Te mostramos accesos rápidos.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="dashboard">
    <article class="hero-card">
      <div class="hero-copy">
        <div class="hero-icon">
          <Sparkles :size="20" />
        </div>
        <p class="eyebrow">Bienvenido</p>
        <h2>Hola, {{ guestName }}. Tu estadía en Hotel La Mansión, organizada en un solo lugar.</h2>
        <p>
          Consulta habitaciones disponibles, revisa tus reservaciones, descubre el menú del día y
          explora puntos turísticos de Sorata desde tu panel.
        </p>
      </div>

      <div class="hero-note">
        <span>Resumen huésped</span>
        <strong>{{ loading ? 'Cargando...' : `${reservacionesActivas} activas` }}</strong>
        <small>Total de reservaciones: {{ loading ? 'Cargando...' : totalReservaciones }}</small>
      </div>
    </article>

    <p v-if="error" class="inline-message">{{ error }}</p>

    <div class="summary-grid">
      <RouterLink
        v-for="card in summaryCards"
        :key="card.title"
        :to="card.to"
        class="summary-card"
        :class="`tone-${card.tone}`"
      >
        <div class="card-icon">
          <component :is="card.icon" :size="21" />
        </div>
        <div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </div>
        <span class="card-action">
          Ver detalle
          <ArrowRight :size="16" />
        </span>
      </RouterLink>
    </div>

    <section class="recent-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow dark">Actividad reciente</p>
          <h3>Últimas reservaciones</h3>
        </div>
      </div>

      <div v-if="loading" class="state-card">Cargando resumen...</div>

      <div v-else-if="ultimasReservaciones.length === 0" class="state-card">
        Aún no hay reservaciones recientes para mostrar.
      </div>

      <div v-else class="recent-list">
        <article v-for="item in ultimasReservaciones" :key="item.id || item.codigo_checkin" class="recent-item">
          <div>
            <strong>Habitación {{ item.habitacion?.numero || item.numero_habitacion || 'No registrada' }}</strong>
            <span>{{ formatDate(item.fecha_entrada) }} - {{ formatDate(item.fecha_salida) }}</span>
          </div>
          <span class="status-pill">{{ item.estado_reservacion || item.estado || 'Pendiente' }}</span>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.hero-card {
  position: relative;
  overflow: hidden;
  min-height: 260px;
  padding: 30px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  align-items: end;
  border-radius: var(--hotel-radius);
  background:
    linear-gradient(110deg, rgba(31, 41, 51, 0.86), rgba(31, 41, 51, 0.34)),
    url('../assets/hero.png') center / cover;
  box-shadow: var(--hotel-shadow);
  color: #fff;
}

.hero-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 5px;
  background: linear-gradient(90deg, var(--hotel-green), var(--hotel-gold));
}

.hero-copy,
.hero-note {
  position: relative;
  z-index: 1;
}

.hero-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 15px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  color: #f4d99e;
}

.eyebrow {
  margin-bottom: 8px;
  color: #f4d99e;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow.dark {
  color: #9a6b2f;
}

.hero-card h2 {
  max-width: 780px;
  margin: 0;
  color: #fff;
  font-size: 34px;
  line-height: 1.14;
  font-weight: 850;
}

.hero-card p {
  max-width: 680px;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.65;
}

.hero-note {
  padding: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--hotel-ink);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.18);
}

.hero-note span,
.hero-note small {
  display: block;
  color: var(--hotel-muted);
}

.hero-note strong {
  display: block;
  margin: 7px 0 8px;
  color: var(--hotel-green-dark);
  font-size: 18px;
}

.inline-message,
.state-card {
  padding: 14px 16px;
  border-radius: 8px;
  background: #fff8e8;
  color: #8a5d1f;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.summary-card,
.recent-panel {
  border-radius: var(--hotel-radius);
  background: var(--hotel-panel);
  box-shadow: var(--hotel-shadow-soft);
  border: 1px solid rgba(230, 223, 210, 0.8);
}

.summary-card {
  min-height: 220px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  color: var(--hotel-ink);
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 45px rgba(31, 41, 51, 0.14);
}

.card-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #fff;
}

.tone-green .card-icon {
  background: var(--hotel-green);
}

.tone-gold .card-icon {
  background: var(--hotel-gold);
}

.tone-ink .card-icon {
  background: var(--hotel-ink-soft);
}

.summary-card h3,
.recent-panel h3 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
  font-size: 18px;
}

.summary-card p {
  margin: 0;
  color: var(--hotel-muted);
  line-height: 1.55;
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--hotel-green-dark);
  font-size: 14px;
  font-weight: 800;
}

.recent-panel {
  padding: 24px;
}

.section-head {
  margin-bottom: 16px;
}

.recent-list {
  display: grid;
  gap: 12px;
}

.recent-item {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-radius: 8px;
  background: #fbf8f1;
}

.recent-item strong,
.recent-item span {
  display: block;
}

.recent-item span {
  color: var(--hotel-muted);
  font-size: 14px;
}

.status-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .hero-card,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    padding: 22px;
  }

  .hero-card h2 {
    font-size: 26px;
  }

  .recent-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
