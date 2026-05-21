<script setup>
import { ServerOff, RotateCw, Home } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { backendStatus } from '../stores/backendStatus';
import { checkBackendConnection } from '../api/axios';

const router = useRouter();

async function retryConnection() {
  backendStatus.isRetrying = true;

  try {
    await checkBackendConnection();
  } finally {
    backendStatus.isRetrying = false;
  }
}

function goHome() {
  router.push('/login');
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="backendStatus.isOffline"
      class="backend-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backend-modal-title"
    >
      <section class="backend-modal-card">
        <div class="modal-icon">
          <ServerOff :size="28" />
        </div>

        <div class="modal-copy">
          <p class="modal-kicker">Hotel La Mansi&oacute;n</p>
          <h2 id="backend-modal-title">Servidor no disponible</h2>
          <p>
            No se pudo conectar con el servidor del hotel. Verifica que el backend est&eacute; encendido.
          </p>
        </div>

        <div class="modal-actions">
          <button
            class="primary-action"
            type="button"
            :disabled="backendStatus.isRetrying"
            @click="retryConnection"
          >
            <RotateCw :size="18" :class="{ spinning: backendStatus.isRetrying }" />
            {{ backendStatus.isRetrying ? 'Reintentando...' : 'Reintentar' }}
          </button>

          <button class="secondary-action" type="button" @click="goHome">
            <Home :size="18" />
            Ir al inicio
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.backend-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 22px;
  display: grid;
  place-items: center;
  background: rgba(18, 24, 31, 0.72);
  backdrop-filter: blur(5px);
}

.backend-modal-card {
  width: min(100%, 460px);
  padding: 30px;
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 247, 240, 0.98)),
    #fff;
  border: 1px solid rgba(230, 223, 210, 0.9);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
  text-align: center;
}

.modal-icon {
  width: 62px;
  height: 62px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
  box-shadow: 0 16px 34px rgba(78, 111, 82, 0.28);
}

.modal-kicker {
  margin: 0 0 8px;
  color: #9a6b2f;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modal-copy h2 {
  margin: 0;
  color: var(--hotel-ink);
  font-size: 26px;
  line-height: 1.15;
}

.modal-copy p:last-child {
  margin: 14px 0 0;
  color: var(--hotel-muted);
  line-height: 1.6;
  font-weight: 700;
}

.modal-actions {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.primary-action,
.secondary-action {
  min-height: 46px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
}

.primary-action {
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
  box-shadow: 0 14px 28px rgba(78, 111, 82, 0.22);
}

.primary-action:disabled {
  cursor: wait;
  opacity: 0.74;
}

.secondary-action {
  background: #fff8e8;
  color: #6f4c1f;
  border: 1px solid rgba(201, 169, 106, 0.42);
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 520px) {
  .backend-modal-card {
    padding: 24px 18px;
  }

  .modal-actions {
    grid-template-columns: 1fr;
  }
}
</style>
