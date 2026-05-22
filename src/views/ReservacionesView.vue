<script setup>
import { onMounted, reactive, ref } from 'vue';
import { Plus, CalendarDays, CreditCard, X, Clock3 } from 'lucide-vue-next';
import api from '../api/axios';

const reservaciones = ref([]);
const loading = ref(true);
const actionLoading = ref(false);
const error = ref('');
const success = ref('');
const actionError = ref('');
const activeReservation = ref(null);
const modalType = ref(null);
const today = new Date().toISOString().slice(0, 10);

const cancelForm = reactive({
  motivo: '',
});

const postponeForm = reactive({
  fecha_entrada: '',
  fecha_salida: '',
});

function normalizeList(payload) {
  return payload?.data || payload?.reservaciones || payload || [];
}

function extractApiMessage(err, fallback = 'No pudimos procesar la solicitud.') {
  const data = err.response?.data;

  if (err.response?.status === 403) {
    return 'No tienes permisos para modificar esta reservación.';
  }

  if (data?.message) return data.message;

  if (data?.errors) {
    const firstError = Object.values(data.errors)
      .flat()
      .find(Boolean);

    if (firstError) return firstError;
  }

  return fallback;
}

async function fetchReservaciones() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/huesped/mis-reservaciones');
    reservaciones.value = normalizeList(response.data);
  } catch (err) {
    if (!err.response) return;

    error.value = extractApiMessage(err, 'No pudimos cargar tus reservaciones.');
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
  if (normalized.includes('cancel')) return 'badge red';
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

function canModify(reserva) {
  return ['Pendiente de pago', 'Confirmada'].includes(reserva.estado_reservacion || reserva.estado);
}

function openCancelModal(reserva) {
  activeReservation.value = reserva;
  modalType.value = 'cancel';
  actionError.value = '';
  cancelForm.motivo = '';
}

function openPostponeModal(reserva) {
  activeReservation.value = reserva;
  modalType.value = 'postpone';
  actionError.value = '';
  postponeForm.fecha_entrada = reserva.fecha_entrada?.slice(0, 10) || '';
  postponeForm.fecha_salida = reserva.fecha_salida?.slice(0, 10) || '';
}

function closeModal(force = false) {
  if (actionLoading.value && !force) return;

  modalType.value = null;
  activeReservation.value = null;
  actionError.value = '';
}

function validatePostponeForm() {
  actionError.value = '';

  if (!postponeForm.fecha_entrada) {
    actionError.value = 'Selecciona una fecha de entrada.';
    return false;
  }

  if (!postponeForm.fecha_salida) {
    actionError.value = 'Selecciona una fecha de salida.';
    return false;
  }

  if (postponeForm.fecha_entrada < today) {
    actionError.value = 'La fecha de entrada no puede ser anterior a hoy.';
    return false;
  }

  if (postponeForm.fecha_salida <= postponeForm.fecha_entrada) {
    actionError.value = 'La fecha de salida debe ser posterior a la fecha de entrada.';
    return false;
  }

  return true;
}

async function submitCancel() {
  if (!activeReservation.value) return;

  actionLoading.value = true;
  actionError.value = '';
  success.value = '';

  try {
    const payload = cancelForm.motivo.trim()
      ? { motivo: cancelForm.motivo.trim() }
      : {};

    await api.patch(`/huesped/reservaciones/${activeReservation.value.id}/cancelar`, payload);
    success.value = 'Reservación cancelada correctamente.';
    closeModal(true);
    await fetchReservaciones();
  } catch (err) {
    if (!err.response) return;

    actionError.value = extractApiMessage(err, 'No pudimos cancelar la reservación.');
  } finally {
    actionLoading.value = false;
  }
}

async function submitPostpone() {
  if (!activeReservation.value || !validatePostponeForm()) return;

  actionLoading.value = true;
  actionError.value = '';
  success.value = '';

  try {
    await api.patch(`/huesped/reservaciones/${activeReservation.value.id}/posponer`, {
      fecha_entrada: postponeForm.fecha_entrada,
      fecha_salida: postponeForm.fecha_salida,
    });

    success.value = 'Reservación pospuesta correctamente.';
    closeModal(true);
    await fetchReservaciones();
  } catch (err) {
    if (!err.response) return;

    actionError.value = extractApiMessage(err, 'No pudimos posponer la reservación.');
  } finally {
    actionLoading.value = false;
  }
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

    <p v-if="success" class="message success">{{ success }}</p>
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

        <div class="reservation-actions">
          <template v-if="canModify(reserva)">
            <button class="action-button postpone" type="button" @click="openPostponeModal(reserva)">
              <Clock3 :size="16" />
              Posponer
            </button>
            <button class="action-button cancel" type="button" @click="openCancelModal(reserva)">
              <X :size="16" />
              Cancelar
            </button>
          </template>
          <span v-else class="unavailable-action">No disponible para modificación.</span>
        </div>

        <p v-if="reserva.codigo_checkin" class="checkin">
          Código check-in: <strong>{{ reserva.codigo_checkin }}</strong>
        </p>
      </article>
    </div>

    <div v-if="modalType" class="modal-backdrop" role="presentation" @click.self="closeModal">
      <section class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <p class="eyebrow">Reservación {{ activeReservation?.id }}</p>
            <h3>{{ modalType === 'cancel' ? 'Cancelar reservación' : 'Posponer reservación' }}</h3>
          </div>
          <button class="icon-button" type="button" :disabled="actionLoading" @click="closeModal">
            <X :size="18" />
          </button>
        </div>

        <p v-if="actionError" class="message error">{{ actionError }}</p>

        <form v-if="modalType === 'cancel'" class="modal-form" @submit.prevent="submitCancel">
          <label>
            Motivo opcional
            <textarea v-model="cancelForm.motivo" rows="4" maxlength="1000" placeholder="Puedes contarnos el motivo si lo deseas."></textarea>
          </label>

          <div class="modal-actions">
            <button class="secondary-button" type="button" :disabled="actionLoading" @click="closeModal">
              Volver
            </button>
            <button class="danger-button" type="submit" :disabled="actionLoading">
              {{ actionLoading ? 'Cancelando...' : 'Confirmar cancelación' }}
            </button>
          </div>
        </form>

        <form v-else class="modal-form" @submit.prevent="submitPostpone">
          <label>
            Nueva fecha de entrada
            <input v-model="postponeForm.fecha_entrada" type="date" :min="today" required />
          </label>

          <label>
            Nueva fecha de salida
            <input v-model="postponeForm.fecha_salida" type="date" :min="postponeForm.fecha_entrada || today" required />
          </label>

          <div class="modal-actions">
            <button class="secondary-button" type="button" :disabled="actionLoading" @click="closeModal">
              Volver
            </button>
            <button class="confirm-button" type="submit" :disabled="actionLoading">
              {{ actionLoading ? 'Guardando...' : 'Guardar nuevas fechas' }}
            </button>
          </div>
        </form>
      </section>
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
.message,
.modal-card {
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

.page-head h2,
.modal-head h3 {
  margin: 0 0 8px;
  color: var(--hotel-ink);
}

.page-head p,
.modal-head p {
  margin: 0;
  color: var(--hotel-muted);
}

.primary-action,
.action-button,
.secondary-button,
.danger-button,
.confirm-button {
  min-height: 42px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

.primary-action,
.confirm-button {
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
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

.message.success {
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
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

.badge.red {
  background: #fff0ed;
  color: #b42318;
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

.reservation-actions {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-button.postpone {
  background: #fff8df;
  color: #8a5d1f;
  border: 1px solid #f2d995;
}

.action-button.cancel,
.danger-button {
  background: #fff0ed;
  color: #b42318;
  border: 1px solid #ffd0c7;
}

.secondary-button {
  background: #fbf8f1;
  color: var(--hotel-ink-soft);
  border: 1px solid var(--hotel-border);
}

.unavailable-action {
  padding: 10px 12px;
  border-radius: 8px;
  background: #fbf8f1;
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  padding: 20px;
  display: grid;
  place-items: center;
  background: rgba(31, 41, 51, 0.46);
}

.modal-card {
  width: min(520px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  padding: 22px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.icon-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #fbf8f1;
  color: var(--hotel-ink-soft);
  cursor: pointer;
}

.modal-form {
  display: grid;
  gap: 14px;
}

label {
  display: grid;
  gap: 7px;
  color: var(--hotel-ink-soft);
  font-size: 13px;
  font-weight: 800;
}

input,
textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: #fff;
  color: var(--hotel-ink);
  font: inherit;
}

textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

button:disabled {
  cursor: wait;
  opacity: 0.72;
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

@media (max-width: 560px) {
  .primary-action,
  .action-button,
  .secondary-button,
  .danger-button,
  .confirm-button {
    width: 100%;
  }

  .modal-card {
    padding: 18px;
  }
}
</style>
