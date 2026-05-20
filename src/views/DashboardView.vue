<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  BedDouble,
  CalendarCheck,
  Utensils,
  ArrowRight,
  Sparkles,
  MapPinned,
  Clock,
  Coffee,
  Soup,
  UtensilsCrossed,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';
import api from '../api/axios';

const loading = ref(true);
const error = ref('');
const dashboard = ref(null);
const paquetes = ref([]);
const paquetesLoading = ref(true);
const paquetesError = ref('');
const activePackageIndex = ref(0);
let packageCarouselInterval = null;

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
const activePackage = computed(() => paquetes.value[activePackageIndex.value] || null);
const hasPackageControls = computed(() => paquetes.value.length > 1);

function formatDate(value) {
  if (!value) return 'No registrado';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function normalizePaquetes(payload) {
  const data = payload?.data || payload?.paquetes || payload;
  return Array.isArray(data) ? data : [];
}

function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(number);
}

function getShortDescription(paquete) {
  return (
    paquete.descripcion_corta ||
    paquete.descripcion ||
    'Una experiencia preparada para disfrutar Hotel La Mansion y Sorata con comodidad.'
  );
}

function getRoomType(paquete) {
  return paquete.tipo_habitacion?.nombre || paquete.tipo_habitacion || paquete.habitacion?.tipo || 'Habitacion incluida';
}

function getTourName(paquete) {
  return paquete.tour?.nombre || paquete.tour_incluido || paquete.nombre_tour || paquete.tour || '';
}

function getPackageDays(paquete) {
  return paquete.duracion_dias || paquete.dias || paquete.duracion || 'Consultar';
}

function includesMeal(paquete, meal) {
  const directValue = paquete[meal] ?? paquete[`incluye_${meal}`];
  if (typeof directValue === 'boolean') return directValue;
  if (Number(directValue) === 1) return true;

  const comidas = paquete.comidas_incluidas || paquete.comidas || [];
  if (Array.isArray(comidas)) {
    return comidas.map((item) => String(item).toLowerCase()).includes(meal);
  }

  return Boolean(comidas?.[meal]);
}

function resolveImage(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const apiOrigin = new URL(api.defaults.baseURL).origin;
  const cleanPath = String(path).replace(/^\/+/, '').replace(/^storage\//, '');
  return `${apiOrigin}/storage/${cleanPath}`;
}

function getPackageImage(paquete) {
  return resolveImage(paquete.imagen || paquete.imagen_url || paquete.foto || paquete.foto_url);
}

function goToPackage(index) {
  if (!paquetes.value.length) return;
  activePackageIndex.value = (index + paquetes.value.length) % paquetes.value.length;
}

function nextPackage() {
  goToPackage(activePackageIndex.value + 1);
}

function previousPackage() {
  goToPackage(activePackageIndex.value - 1);
}

function stopPackageCarousel() {
  if (packageCarouselInterval) {
    clearInterval(packageCarouselInterval);
    packageCarouselInterval = null;
  }
}

function startPackageCarousel() {
  stopPackageCarousel();

  if (paquetes.value.length <= 1) return;

  packageCarouselInterval = setInterval(() => {
    nextPackage();
  }, 5000);
}

async function fetchDashboard() {
  try {
    const response = await api.get('/huesped/dashboard');
    dashboard.value = response.data?.data || response.data;
  } catch {
    error.value = 'No pudimos cargar el resumen en este momento. Te mostramos accesos rapidos.';
  } finally {
    loading.value = false;
  }
}

async function fetchPaquetes() {
  paquetesLoading.value = true;
  paquetesError.value = '';

  try {
    const response = await api.get('/huesped/paquetes');
    paquetes.value = normalizePaquetes(response.data);
    activePackageIndex.value = 0;
    startPackageCarousel();
  } catch (err) {
    paquetesError.value =
      err.response?.data?.message || 'No pudimos cargar los paquetes destacados en este momento.';
  } finally {
    paquetesLoading.value = false;
  }
}

onMounted(() => {
  fetchDashboard();
  fetchPaquetes();
});

onUnmounted(() => {
  stopPackageCarousel();
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

    <section class="packages-feature">
      <div class="section-head packages-feature-head">
        <div>
          <p class="eyebrow dark">Experiencias</p>
          <h3>Paquetes destacados</h3>
        </div>
        <span class="section-note">Estadías, sabores y recorridos pensados para huéspedes.</span>
      </div>

      <p v-if="paquetesError" class="message error">{{ paquetesError }}</p>

      <div v-if="paquetesLoading" class="state-card">Cargando paquetes destacados...</div>

      <div v-else-if="paquetes.length === 0" class="state-card">
        Aún no hay paquetes publicados.
      </div>

      <div v-else-if="activePackage" class="package-carousel">
        <article class="package-hero" :key="activePackage.id || activePackage.nombre || activePackageIndex">
          <div class="package-image">
            <img
              v-if="getPackageImage(activePackage)"
              :src="getPackageImage(activePackage)"
              :alt="activePackage.nombre"
            />
            <div v-else class="package-image-fallback">
              <Sparkles :size="42" />
              <span>Hotel La Mansión</span>
            </div>
          </div>

          <div class="package-content">
            <span v-if="activePackage.estado" class="package-status">{{ activePackage.estado }}</span>

            <div class="package-copy">
              <p class="eyebrow">Paquete destacado</p>
              <h4>{{ activePackage.nombre || 'Paquete especial' }}</h4>
              <p class="package-description">{{ getShortDescription(activePackage) }}</p>
            </div>

            <div class="package-meta">
              <span>
                <BedDouble :size="16" />
                {{ getRoomType(activePackage) }}
              </span>
              <span>
                <Clock :size="16" />
                {{ getPackageDays(activePackage) }} días
              </span>
              <span v-if="getTourName(activePackage)">
                <MapPinned :size="16" />
                Tour: {{ getTourName(activePackage) }}
              </span>
            </div>

            <div class="meal-row" aria-label="Comidas incluidas">
              <span :class="{ included: includesMeal(activePackage, 'desayuno') }">
                <Coffee :size="15" />
                Desayuno
              </span>
              <span :class="{ included: includesMeal(activePackage, 'almuerzo') }">
                <Soup :size="15" />
                Almuerzo
              </span>
              <span :class="{ included: includesMeal(activePackage, 'cena') }">
                <UtensilsCrossed :size="15" />
                Cena
              </span>
            </div>

            <div class="package-footer">
              <strong>{{ formatMoney(activePackage.precio_total || activePackage.precio) }}</strong>
              <button class="package-button" type="button">
                <Eye :size="17" />
                Ver paquete
              </button>
            </div>
          </div>
        </article>

        <div v-if="hasPackageControls" class="package-controls">
          <button class="carousel-button" type="button" aria-label="Paquete anterior" @click="previousPackage">
            <ChevronLeft :size="20" />
          </button>

          <div class="package-dots" aria-label="Seleccionar paquete">
            <button
              v-for="(_, index) in paquetes"
              :key="index"
              type="button"
              :class="{ active: index === activePackageIndex }"
              :aria-label="`Ver paquete ${index + 1}`"
              @click="goToPackage(index)"
            />
          </div>

          <button class="carousel-button" type="button" aria-label="Siguiente paquete" @click="nextPackage">
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </section>

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
.packages-feature,
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
.packages-feature h3,
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

.packages-feature {
  padding: 26px;
  overflow: hidden;
}

.packages-feature-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-note {
  max-width: 360px;
  color: var(--hotel-muted);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  text-align: right;
}

.message {
  padding: 14px 16px;
  border-radius: 8px;
  background: #fff8e8;
  color: #8a5d1f;
  font-weight: 700;
}

.message.error {
  background: #fff0ed;
  color: #b42318;
}

.package-carousel {
  display: grid;
  gap: 16px;
}

.package-hero {
  position: relative;
  overflow: hidden;
  min-height: 430px;
  display: grid;
  grid-template-columns: minmax(340px, 1.05fr) minmax(360px, 0.95fr);
  border-radius: 8px;
  background:
    linear-gradient(135deg, #1f2933, #4e6f52 55%, #9a6b2f),
    #1f2933;
  box-shadow: 0 24px 60px rgba(31, 41, 51, 0.18);
  animation: packageFade 0.42s ease;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;
}

.package-hero:hover {
  transform: translateY(-3px);
  box-shadow: 0 30px 70px rgba(31, 41, 51, 0.22);
}

.package-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(31, 41, 51, 0.1), rgba(31, 41, 51, 0.76)),
    linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(31, 41, 51, 0.16));
  pointer-events: none;
}

.package-image {
  position: relative;
  min-height: 430px;
  overflow: hidden;
}

.package-image img {
  width: 100%;
  height: 100%;
  min-height: 430px;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.package-hero:hover .package-image img {
  transform: scale(1.04);
}

.package-image-fallback {
  height: 100%;
  min-height: 430px;
  padding: 34px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  background:
    linear-gradient(135deg, rgba(31, 41, 51, 0.9), rgba(111, 143, 114, 0.74)),
    url('../assets/hero.png') center / cover;
  color: #fff;
  font-size: 24px;
  font-weight: 900;
}

.package-content {
  position: relative;
  z-index: 1;
  min-width: 0;
  padding: 38px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  color: #fff;
}

.package-status {
  align-self: flex-start;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--hotel-green-dark);
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 10px 25px rgba(31, 41, 51, 0.14);
}

.package-copy h4 {
  max-width: 620px;
  margin: 0;
  color: #fff;
  font-size: 34px;
  line-height: 1.12;
  font-weight: 900;
}

.package-description {
  max-width: 620px;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 16px;
  line-height: 1.7;
}

.package-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.package-meta span,
.meal-row span,
.package-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.package-meta span {
  min-height: 38px;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.meal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meal-row span {
  min-height: 34px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 900;
}

.meal-row span.included {
  background: rgba(244, 217, 158, 0.94);
  color: #5f421b;
}

.package-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 4px;
}

.package-footer strong {
  color: #f4d99e;
  font-size: 30px;
  line-height: 1;
  white-space: nowrap;
}

.package-button {
  min-height: 46px;
  padding: 0 18px;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--hotel-gold), #9a6b2f);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.package-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.24);
}

.package-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.carousel-button {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #fff8e8;
  color: var(--hotel-green-dark);
  box-shadow: var(--hotel-shadow-soft);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.carousel-button:hover {
  transform: translateY(-2px);
  background: var(--hotel-gold-soft);
}

.package-dots {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.package-dots button {
  width: 9px;
  height: 9px;
  padding: 0;
  border-radius: 999px;
  background: #d8cdb9;
  cursor: pointer;
  transition:
    width 0.22s ease,
    background 0.22s ease;
}

.package-dots button.active {
  width: 28px;
  background: var(--hotel-green-dark);
}

@keyframes packageFade {
  from {
    opacity: 0.2;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .package-hero {
    grid-template-columns: minmax(280px, 0.9fr) minmax(340px, 1.1fr);
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

  .packages-feature {
    padding: 18px;
  }

  .packages-feature-head {
    display: grid;
  }

  .section-note {
    max-width: none;
    text-align: left;
  }

  .package-hero {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .package-hero::after {
    background: linear-gradient(180deg, rgba(31, 41, 51, 0.1), rgba(31, 41, 51, 0.78));
  }

  .package-image,
  .package-image img,
  .package-image-fallback {
    min-height: 240px;
  }

  .package-content {
    padding: 24px;
  }

  .package-copy h4 {
    font-size: 26px;
  }

  .package-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .package-footer strong {
    font-size: 25px;
  }

  .package-button {
    width: 100%;
  }

  .recent-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
