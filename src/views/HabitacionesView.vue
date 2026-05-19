<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Users, BadgeDollarSign, BedDouble } from 'lucide-vue-next';
import api from '../api/axios';

const router = useRouter();
const habitaciones = ref([]);
const fechaEntrada = ref('');
const fechaSalida = ref('');
const loading = ref(false);
const error = ref('');

const today = new Date().toISOString().slice(0, 10);

function normalizeRooms(payload) {
  return payload?.data || payload?.habitaciones || payload || [];
}

function validateDates(requireBoth = false) {
  error.value = '';

  if (requireBoth && !fechaEntrada.value) {
    error.value = 'La fecha de entrada es requerida para buscar por fechas.';
    return false;
  }

  if (requireBoth && !fechaSalida.value) {
    error.value = 'La fecha de salida es requerida para buscar por fechas.';
    return false;
  }

  if (fechaEntrada.value && fechaEntrada.value < today) {
    error.value = 'La fecha de entrada no puede ser anterior a hoy.';
    return false;
  }

  if (fechaEntrada.value && fechaSalida.value && fechaSalida.value <= fechaEntrada.value) {
    error.value = 'La fecha de salida debe ser posterior a la fecha de entrada.';
    return false;
  }

  return true;
}

async function fetchHabitaciones(requireDates = false) {
  if (!validateDates(requireDates)) return;

  loading.value = true;
  error.value = '';

  try {
    const params = {};

    if (fechaEntrada.value && fechaSalida.value) {
      params.fecha_entrada = fechaEntrada.value;
      params.fecha_salida = fechaSalida.value;
    }

    const response = await api.get('/huesped/habitaciones-disponibles', { params });
    habitaciones.value = normalizeRooms(response.data);
  } catch (err) {
    error.value =
      err.response?.data?.message || 'No pudimos cargar las habitaciones disponibles.';
  } finally {
    loading.value = false;
  }
}

function reservar(habitacion) {
  router.push({
    path: '/panel/reservar',
    query: { habitacion_id: habitacion.id },
  });
}

function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(number);
}

onMounted(() => fetchHabitaciones(false));
</script>

<template>
  <section class="catalog-page">
    <div class="filter-card">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h2>Habitaciones disponibles</h2>
        <p>Busca disponibilidad por fechas o explora el catálogo publicado para huéspedes.</p>
      </div>

      <form class="filters" @submit.prevent="fetchHabitaciones(true)">
        <label>
          Fecha entrada
          <input v-model="fechaEntrada" type="date" :min="today" />
        </label>

        <label>
          Fecha salida
          <input v-model="fechaSalida" type="date" :min="fechaEntrada || today" />
        </label>

        <button type="submit" :disabled="loading">
          <Search :size="17" />
          {{ loading ? 'Buscando...' : 'Buscar disponibilidad' }}
        </button>
      </form>
    </div>

    <p v-if="error" class="message error">{{ error }}</p>
    <div v-if="loading" class="state-card">Cargando habitaciones...</div>

    <div v-else-if="habitaciones.length === 0" class="state-card">
      No hay habitaciones disponibles para los criterios seleccionados.
    </div>

    <div v-else class="room-grid">
      <article v-for="habitacion in habitaciones" :key="habitacion.id" class="room-card">
        <div class="room-image">
          <BedDouble :size="30" />
          <span>Habitación {{ habitacion.numero || 'No registrada' }}</span>
        </div>

        <div class="room-body">
          <span class="status">{{ habitacion.estado || 'Disponible' }}</span>
          <h3>{{ habitacion.tipo || habitacion.tipo_habitacion || 'Habitación' }}</h3>
          <p class="description">
            {{ habitacion.descripcion || 'Espacio cómodo preparado para una estadía tranquila.' }}
          </p>

          <div class="room-meta">
            <span>
              <Users :size="16" />
              {{ habitacion.capacidad || 'No registrada' }} personas
            </span>
            <span>
              <BadgeDollarSign :size="16" />
              {{ formatMoney(habitacion.precio_noche || habitacion.precio) }} / noche
            </span>
          </div>

          <button class="reserve-button" type="button" @click="reservar(habitacion)">
            Reservar
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.catalog-page {
  display: grid;
  gap: 20px;
}

.filter-card,
.room-card,
.state-card,
.message {
  border-radius: var(--hotel-radius);
  background: #fff;
  box-shadow: var(--hotel-shadow-soft);
  border: 1px solid rgba(230, 223, 210, 0.82);
}

.filter-card {
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: end;
}

.eyebrow {
  margin-bottom: 8px;
  color: #9a6b2f;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-card h2 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
}

.filter-card p {
  margin: 0;
  color: var(--hotel-muted);
}

.filters {
  display: flex;
  gap: 12px;
  align-items: end;
}

label {
  display: grid;
  gap: 7px;
  color: var(--hotel-ink-soft);
  font-size: 13px;
  font-weight: 800;
}

input {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: #fff;
  color: var(--hotel-ink);
}

.filters button,
.reserve-button {
  min-height: 42px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.message,
.state-card {
  padding: 16px;
  color: var(--hotel-muted);
  font-weight: 700;
}

.message.error {
  background: #fff0ed;
  color: #b42318;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.room-card {
  overflow: hidden;
}

.room-image {
  min-height: 150px;
  padding: 18px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  background:
    linear-gradient(135deg, rgba(31, 41, 51, 0.82), rgba(111, 143, 114, 0.68)),
    url('../assets/hero.png') center / cover;
  color: #fff;
  font-weight: 900;
}

.room-body {
  padding: 20px;
}

.status {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
  font-size: 12px;
  font-weight: 900;
}

.room-body h3 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
}

.description {
  min-height: 48px;
  margin: 0;
  color: var(--hotel-muted);
  line-height: 1.55;
}

.room-meta {
  margin: 16px 0;
  display: grid;
  gap: 8px;
  color: var(--hotel-ink-soft);
  font-size: 14px;
  font-weight: 700;
}

.room-meta span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reserve-button {
  width: 100%;
}

@media (max-width: 1100px) {
  .filter-card,
  .filters {
    grid-template-columns: 1fr;
  }

  .filter-card {
    display: grid;
  }

  .filters {
    display: grid;
  }

  .room-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .room-grid {
    grid-template-columns: 1fr;
  }
}
</style>
