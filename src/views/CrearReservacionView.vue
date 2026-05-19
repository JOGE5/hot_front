<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CalendarPlus } from 'lucide-vue-next';
import api from '../api/axios';

const route = useRoute();
const router = useRouter();

const today = new Date().toISOString().slice(0, 10);
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = reactive({
  habitacion_id: '',
  fecha_entrada: '',
  fecha_salida: '',
  cantidad_personas: 1,
});

function validateForm() {
  error.value = '';

  if (!form.habitacion_id) {
    error.value = 'Selecciona o ingresa una habitación para reservar.';
    return false;
  }

  if (!form.fecha_entrada) {
    error.value = 'La fecha de entrada es requerida.';
    return false;
  }

  if (form.fecha_entrada < today) {
    error.value = 'La fecha de entrada no puede ser anterior a hoy.';
    return false;
  }

  if (!form.fecha_salida) {
    error.value = 'La fecha de salida es requerida.';
    return false;
  }

  if (form.fecha_salida <= form.fecha_entrada) {
    error.value = 'La fecha de salida debe ser posterior a la fecha de entrada.';
    return false;
  }

  const people = Number(form.cantidad_personas);

  if (!Number.isInteger(people) || people < 1) {
    error.value = 'La cantidad de personas debe ser un número entero mínimo de 1.';
    return false;
  }

  return true;
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
    error.value =
      err.response?.data?.message ||
      err.response?.data?.errors?.habitacion_id?.[0] ||
      'No pudimos crear la reservación. Revisa los datos e intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (route.query.habitacion_id) {
    form.habitacion_id = String(route.query.habitacion_id);
  }
});
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
      <p v-if="error" class="message error">{{ error }}</p>
      <p v-if="success" class="message success">{{ success }}</p>

      <form class="reservation-form" @submit.prevent="submitReservation">
        <label>
          Habitación
          <input v-model="form.habitacion_id" type="number" min="1" required />
        </label>

        <label>
          Fecha entrada
          <input v-model="form.fecha_entrada" type="date" :min="today" required />
        </label>

        <label>
          Fecha salida
          <input v-model="form.fecha_salida" type="date" :min="form.fecha_entrada || today" required />
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
  margin-bottom: 16px;
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

input {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: #fff;
  color: var(--hotel-ink);
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
