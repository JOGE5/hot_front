<script setup>
import { onMounted, ref } from 'vue';
import { Plus, CalendarDays, CreditCard } from 'lucide-vue-next';
import api from '../api/axios';

const reservaciones = ref([]);
const loading = ref(true);
const error = ref('');

function normalizeList(payload) {
  return payload?.data || payload?.reservaciones || payload || [];
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

  return 'No pudimos cargar tus reservaciones.';
}

async function fetchReservaciones() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/huesped/mis-reservaciones');
    reservaciones.value = normalizeList(response.data);
  } catch (err) {
    if (!err.response) return;

    error.value = extractApiMessage(err);
  } finally {
    loading.value = false;
  }
}

function formatFecha(fecha) {
  if (!fecha) return 'No registrada';
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(value) {
  if (value === null || value === undefined) return 'No confirmado';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function badgeClass(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized.includes('confirm')) return 'badge green';
  if (normalized.includes('estad')) return 'badge blue';
  if (normalized.includes('final')) return 'badge gray';
  if (normalized.includes('pend')) return 'badge yellow';
  return 'badge gray';
}

function getRoomLabel(reserva) {
  if (typeof reserva.habitacion === 'string' || typeof reserva.habitacion === 'number') {
    return reserva.habitacion;
  }

  return (
    reserva.habitacion?.numero ||
    reserva.numero_habitacion ||
    'No registrada'
  );
}

onMounted(fetchReservaciones);
</script>

<template>
  <section class="reservations-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Estadías</p>
        <h2>Mis reservaciones</h2>
        <p>Consulta el estado de tus reservas y pagos registrados.</p>
      </div>

      <RouterLink class="primary-action" to="/panel/reservar">
        <Plus :size="17" />
        Nueva reservación
      </RouterLink>
    </div>

    <div v-if="loading" class="state-card">Cargando reservaciones...</div>
    <p v-else-if="error" class="message error">{{ error }}</p>
    <div v-else-if="reservaciones.length === 0" class="state-card">
      Aún no tienes reservaciones registradas.
    </div>

    <div v-else class="reservation-grid">
      <article v-for="reserva in reservaciones" :key="reserva.id || reserva.codigo_checkin" class="reservation-card">
        <div class="reservation-top">
          <div>
            <span class="room-label">Habitación</span>
            <h3>{{ getRoomLabel(reserva) }}</h3>
          </div>
          <span :class="badgeClass(reserva.estado_reservacion || reserva.estado)">
            {{ reserva.estado_reservacion || reserva.estado || 'Pendiente' }}
          </span>
        </div>

        <div class="detail-list">
          <div>
            <CalendarDays :size="16" />
            <span>{{ formatFecha(reserva.fecha_entrada) }} - {{ formatFecha(reserva.fecha_salida) }}</span>
          </div>
          <div>
            <span class="mini-icon">P</span>
            <span>{{ reserva.cantidad_personas || 'No registrada' }} personas</span>
          </div>
          <div>
            <CreditCard :size="16" />
            <span>Total: {{ formatMoney(reserva.total) }}</span>
          </div>
        </div>

        <div class="payment-row">
          <span :class="badgeClass(reserva.estado_pago)">
            {{ reserva.estado_pago || 'Pago Pendiente' }}
          </span>
          <span v-if="reserva.metodo_pago" class="method">{{ reserva.metodo_pago }}</span>
        </div>

        <p v-if="reserva.codigo_checkin" class="checkin">
          Código check-in: <strong>{{ reserva.codigo_checkin }}</strong>
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.reservations-page {
  display: grid;
  gap: 20px;
}

.page-head,
.reservation-card,
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
  align-items: center;
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

.primary-action {
  min-height: 42px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
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

.reservation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.reservation-card {
  padding: 20px;
}

.reservation-top,
.payment-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.room-label {
  display: block;
  margin-bottom: 4px;
  color: var(--hotel-muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.reservation-card h3 {
  margin: 0;
  color: var(--hotel-ink);
  font-size: 22px;
}

.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.badge.yellow {
  background: #fff4c7;
  color: #8a5d1f;
}

.badge.green {
  background: rgba(111, 143, 114, 0.16);
  color: var(--hotel-green-dark);
}

.badge.blue {
  background: #e6f0ff;
  color: #24569a;
}

.badge.gray {
  background: #eef0f2;
  color: #606a75;
}

.detail-list {
  margin: 18px 0;
  display: grid;
  gap: 10px;
}

.detail-list div {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--hotel-ink-soft);
  font-weight: 700;
}

.mini-icon {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--hotel-gold-soft);
  color: #8a5d1f;
  font-size: 10px;
  font-weight: 900;
}

.method {
  color: var(--hotel-muted);
  font-size: 13px;
  font-weight: 800;
}

.checkin {
  margin: 16px 0 0;
  padding: 12px;
  border-radius: 8px;
  background: #fbf8f1;
  color: var(--hotel-ink-soft);
}

@media (max-width: 860px) {
  .page-head,
  .reservation-top,
  .payment-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .reservation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
