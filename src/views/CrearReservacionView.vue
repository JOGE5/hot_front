<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CalendarPlus } from 'lucide-vue-next';
import api from '../api/axios';

const route = useRoute();
const router = useRouter();

const today = new Date().toISOString().slice(0, 10);
const loading = ref(false);
const loadingRooms = ref(false);
const error = ref('');
const warning = ref('');
const success = ref('');
const habitaciones = ref([]);
const initialRoom = ref(null);

const form = reactive({
  habitacion_id: '',
  fecha_entrada: '',
  fecha_salida: '',
  cantidad_personas: 1,
});

const selectedRoom = computed(() => {
  const roomId = Number(form.habitacion_id);

  if (!roomId) return null;

  return habitaciones.value.find((habitacion) => Number(habitacion.id) === roomId) || initialRoom.value;
});

function normalizeRooms(payload) {
  return payload?.data || payload?.habitaciones || payload || [];
}

function getRoomCapacity(habitacion) {
  return Number(habitacion?.capacidad || habitacion?.tipo_habitacion?.capacidad || 0);
}

function getRoomLabel(habitacion) {
  const number = habitacion.numero ? `Habitación ${habitacion.numero}` : `Habitación ${habitacion.id}`;
  const type = habitacion.tipo || habitacion.tipo_habitacion?.nombre || habitacion.tipo_habitacion || 'Disponible';
  const capacity = getRoomCapacity(habitacion);

  return `${number} - ${type}${capacity ? ` - ${capacity} personas` : ''}`;
}

function extractApiMessage(err) {
  const data = err.response?.data;

  if (data?.message) return data.message;

  if (data?.errors) {
    const firstError = Object.values(data.errors)
      .flat()
      .find(Boolean);

    if (firstError) return firstError;
  }

  return 'No pudimos crear la reservación. Revisa los datos e intenta nuevamente.';
}

function validateForm() {
  error.value = '';
  success.value = '';

  if (!form.fecha_entrada) {
    error.value = 'Selecciona una fecha de entrada.';
    return false;
  }

  if (!form.fecha_salida) {
    error.value = 'Selecciona una fecha de salida.';
    return false;
  }

  if (form.fecha_entrada < today) {
    error.value = 'La fecha de entrada no puede ser anterior a hoy.';
    return false;
  }

  if (form.fecha_salida <= form.fecha_entrada) {
    error.value = 'La fecha de salida debe ser posterior a la fecha de entrada.';
    return false;
  }

  if (!form.habitacion_id) {
    error.value = 'Selecciona una habitación.';
    return false;
  }

  if (form.cantidad_personas === '' || form.cantidad_personas === null || form.cantidad_personas === undefined) {
    error.value = 'Ingresa la cantidad de personas.';
    return false;
  }

  const people = Number(form.cantidad_personas);

  if (!Number.isFinite(people) || people <= 0) {
    error.value = 'La cantidad de personas debe ser mayor a 0.';
    return false;
  }

  const capacity = getRoomCapacity(selectedRoom.value);

  if (capacity && people > capacity) {
    error.value = 'La cantidad de personas supera la capacidad de la habitación.';
    return false;
  }

  return true;
}

async function fetchHabitacionesDisponibles() {
  warning.value = '';
  habitaciones.value = [];

  if (!form.fecha_entrada || !form.fecha_salida) return;
  if (form.fecha_entrada < today || form.fecha_salida <= form.fecha_entrada) return;

  loadingRooms.value = true;

  try {
    const response = await api.get('/huesped/habitaciones-disponibles', {
      params: {
        fecha_entrada: form.fecha_entrada,
        fecha_salida: form.fecha_salida,
      },
    });

    habitaciones.value = normalizeRooms(response.data);

    const currentRoomId = Number(form.habitacion_id);
    const currentRoomIsAvailable = habitaciones.value.some((habitacion) => Number(habitacion.id) === currentRoomId);

    if (currentRoomId && currentRoomIsAvailable) {
      initialRoom.value = null;
    } else if (currentRoomId) {
      form.habitacion_id = '';
      initialRoom.value = null;
    }

    if (habitaciones.value.length === 0) {
      warning.value = 'No hay habitaciones disponibles para las fechas seleccionadas.';
    }
  } catch (err) {
    if (!err.response) return;

    error.value = extractApiMessage(err);
  } finally {
    loadingRooms.value = false;
  }
}

async function submitReservation() {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await api.post('/huesped/reservaciones', {
      habitacion_id: Number(form.habitacion_id),
      fecha_entrada: form.fecha_entrada,
      fecha_salida: form.fecha_salida,
      cantidad_personas: Number(form.cantidad_personas),
    });

    success.value = 'Reservación creada correctamente.';
    setTimeout(() => router.push('/panel/reservaciones'), 900);
  } catch (err) {
    if (!err.response) return;

    error.value = extractApiMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (route.query.habitacion_id) {
    form.habitacion_id = String(route.query.habitacion_id);
  }

  if (route.query.habitacion_id && route.query.capacidad) {
    initialRoom.value = {
      id: Number(route.query.habitacion_id),
      capacidad: Number(route.query.capacidad),
    };
  }
});

watch(
  () => [form.fecha_entrada, form.fecha_salida],
  () => {
    error.value = '';
    warning.value = '';
    fetchHabitacionesDisponibles();
  },
);
</script>

<template>
  <section class="reservation-page">
    <article class="form-card">
      <div class="card-head">
        <div class="icon-box">
          <CalendarPlus :size="22" />
        </div>
        <div>
          <p class="eyebrow">Nueva estadía</p>
          <h2>Crear reservación</h2>
          <p>Completa los datos principales para solicitar tu reservación.</p>
        </div>
      </div>

      <p class="note">El total será calculado y confirmado por el sistema.</p>
      <p class="note warning-note">
        Una habitación solo vuelve a estar disponible 2 días después del check-out anterior.
      </p>
      <p v-if="error" class="message error">{{ error }}</p>
      <p v-if="warning" class="message warning">{{ warning }}</p>
      <p v-if="success" class="message success">{{ success }}</p>

      <form class="reservation-form" @submit.prevent="submitReservation">
        <label>
          Fecha entrada
          <input v-model="form.fecha_entrada" type="date" :min="today" required />
        </label>

        <label>
          Fecha salida
          <input v-model="form.fecha_salida" type="date" :min="form.fecha_entrada || today" required />
        </label>

        <label class="full-field">
          Habitación
          <select v-model="form.habitacion_id" :disabled="loadingRooms || habitaciones.length === 0">
            <option value="">
              {{ loadingRooms ? 'Buscando habitaciones...' : 'Selecciona una habitación' }}
            </option>
            <option v-if="initialRoom && form.habitacion_id" :value="String(initialRoom.id)">
              Habitación seleccionada - {{ getRoomCapacity(initialRoom) }} personas
            </option>
            <option v-for="habitacion in habitaciones" :key="habitacion.id" :value="String(habitacion.id)">
              {{ getRoomLabel(habitacion) }}
            </option>
          </select>
        </label>

        <label>
          Cantidad de personas
          <input v-model.number="form.cantidad_personas" type="number" min="1" step="1" required />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Crear reservación' }}
        </button>
      </form>
    </article>
  </section>
</template>

<style scoped>
.reservation-page {
  display: grid;
  place-items: start center;
}

.form-card {
  width: min(760px, 100%);
  padding: 26px;
  border-radius: var(--hotel-radius);
  background: #fff;
  border: 1px solid rgba(230, 223, 210, 0.82);
  box-shadow: var(--hotel-shadow-soft);
}

.card-head {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.icon-box {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--hotel-green);
  color: #fff;
}

.eyebrow {
  margin-bottom: 8px;
  color: #9a6b2f;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
}

.card-head p:last-child,
.note {
  margin: 0;
  color: var(--hotel-muted);
}

.note {
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fbf8f1;
  font-weight: 700;
}

.message {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.message.error {
  background: #fff0ed;
  color: #b42318;
}

.message.warning,
.warning-note {
  background: #fff8df;
  color: #8a5d1f;
}

.message.success {
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
}

.reservation-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

label {
  display: grid;
  gap: 7px;
  color: var(--hotel-ink-soft);
  font-size: 13px;
  font-weight: 800;
}

input,
select {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: #fff;
  color: var(--hotel-ink);
  font: inherit;
}

select:disabled {
  color: var(--hotel-muted);
  background: #fbf8f1;
}

.full-field {
  grid-column: 1 / -1;
}

button {
  min-height: 46px;
  grid-column: 1 / -1;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(78, 111, 82, 0.22);
}

button:disabled {
  cursor: wait;
  opacity: 0.72;
}

@media (max-width: 680px) {
  .reservation-form,
  .card-head {
    grid-template-columns: 1fr;
  }

  .card-head {
    flex-direction: column;
  }
}
</style>
