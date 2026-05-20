<script setup>
import { computed, reactive, ref } from 'vue';
import { AlertCircle, CheckCircle2, Eye, EyeOff, IdCard, KeyRound, Loader2, Mail, Phone, UserRound, X } from 'lucide-vue-next';
import api from '../api/axios';

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || {};
  } catch {
    return {};
  }
}

const user = readStorage('user');
const huesped = readStorage('huesped');

function valueOrFallback(value) {
  return value || 'No registrado';
}

const fullName = computed(() => {
  const parts = [huesped.nombres, huesped.apellido_paterno, huesped.apellido_materno].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Huésped';
});

const profileRows = computed(() => [
  { label: 'Nombres', value: valueOrFallback(huesped.nombres) },
  { label: 'Apellido paterno', value: valueOrFallback(huesped.apellido_paterno) },
  { label: 'Apellido materno', value: valueOrFallback(huesped.apellido_materno) },
  { label: 'Teléfono / Celular', value: valueOrFallback(huesped.telefono), icon: Phone },
  { label: 'Número documento', value: valueOrFallback(huesped.numero_documento), icon: IdCard },
  { label: 'Correo de acceso', value: valueOrFallback(user.email), icon: Mail },
]);

const showPasswordModal = ref(false);
const isSavingPassword = ref(false);
const passwordSuccess = ref('');
const passwordError = ref('');
const passwordErrors = reactive({});
const passwordVisibility = reactive({
  actual: false,
  nuevo: false,
  confirmation: false,
});
const passwordForm = reactive({
  password_actual: '',
  password_nuevo: '',
  password_nuevo_confirmation: '',
});

function clearPasswordErrors() {
  Object.keys(passwordErrors).forEach((key) => {
    delete passwordErrors[key];
  });
}

function resetPasswordForm() {
  passwordForm.password_actual = '';
  passwordForm.password_nuevo = '';
  passwordForm.password_nuevo_confirmation = '';
  passwordVisibility.actual = false;
  passwordVisibility.nuevo = false;
  passwordVisibility.confirmation = false;
  clearPasswordErrors();
}

function openPasswordModal() {
  passwordSuccess.value = '';
  passwordError.value = '';
  resetPasswordForm();
  showPasswordModal.value = true;
}

function closePasswordModal() {
  if (isSavingPassword.value) return;

  showPasswordModal.value = false;
  passwordError.value = '';
  resetPasswordForm();
}

function validatePasswordForm() {
  clearPasswordErrors();

  if (!passwordForm.password_actual.trim()) {
    passwordErrors.password_actual = 'La contraseña actual es obligatoria.';
  }

  if (!passwordForm.password_nuevo) {
    passwordErrors.password_nuevo = 'La nueva contraseña es obligatoria.';
  } else if (passwordForm.password_nuevo.length < 8) {
    passwordErrors.password_nuevo = 'La nueva contraseña debe tener al menos 8 caracteres.';
  }

  if (!passwordForm.password_nuevo_confirmation) {
    passwordErrors.password_nuevo_confirmation = 'Confirma la nueva contraseña.';
  } else if (passwordForm.password_nuevo_confirmation !== passwordForm.password_nuevo) {
    passwordErrors.password_nuevo_confirmation = 'La confirmación debe coincidir con la nueva contraseña.';
  }

  return Object.keys(passwordErrors).length === 0;
}

function getApiValidationMessage(error) {
  const data = error?.response?.data;
  const apiErrors = data?.errors;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (apiErrors && typeof apiErrors === 'object') {
    const firstError = Object.values(apiErrors).flat().find(Boolean);

    if (firstError) {
      return firstError;
    }
  }

  return 'La contraseña actual no es correcta.';
}

async function submitPasswordChange() {
  passwordSuccess.value = '';
  passwordError.value = '';

  if (!validatePasswordForm()) return;

  isSavingPassword.value = true;

  try {
    await api.post('/huesped/cambiar-password', {
      password_actual: passwordForm.password_actual,
      password_nuevo: passwordForm.password_nuevo,
      password_nuevo_confirmation: passwordForm.password_nuevo_confirmation,
    });

    passwordSuccess.value = 'Contraseña actualizada correctamente.';
    resetPasswordForm();
    showPasswordModal.value = false;
  } catch (error) {
    if (error?.response?.status === 422) {
      passwordError.value = getApiValidationMessage(error);
    } else {
      passwordError.value = 'No se pudo actualizar la contraseña. Inténtalo nuevamente.';
    }
  } finally {
    isSavingPassword.value = false;
  }
}
</script>

<template>
  <section class="profile-page">
    <article class="profile-card">
      <div class="profile-head">
        <div class="profile-avatar">
          <UserRound :size="34" />
        </div>
        <div class="profile-title">
          <p class="eyebrow">Mi cuenta</p>
          <h2>{{ fullName }}</h2>
          <p>Datos registrados para tu experiencia como huésped.</p>
        </div>
        <button class="password-trigger" type="button" @click="openPasswordModal">
          <KeyRound :size="18" />
          Cambiar contraseña
        </button>
      </div>

      <div class="profile-grid">
        <div v-for="row in profileRows" :key="row.label" class="profile-row">
          <component :is="row.icon || UserRound" :size="17" />
          <div>
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>
      </div>
    </article>

    <p v-if="passwordSuccess" class="floating-message success">
      <CheckCircle2 :size="18" />
      {{ passwordSuccess }}
    </p>

    <Teleport to="body">
      <div v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
        <section class="password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title">
          <div class="modal-head">
            <div>
              <p class="eyebrow">Seguridad</p>
              <h3 id="password-title">Cambiar contraseña</h3>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar" :disabled="isSavingPassword" @click="closePasswordModal">
              <X :size="20" />
            </button>
          </div>

          <form class="password-form" novalidate @submit.prevent="submitPasswordChange">
            <div class="field-group">
              <label for="password-actual">Contraseña actual</label>
              <div class="password-input" :class="{ invalid: passwordErrors.password_actual }">
                <input
                  id="password-actual"
                  v-model="passwordForm.password_actual"
                  :type="passwordVisibility.actual ? 'text' : 'password'"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="reveal-button"
                  :aria-label="passwordVisibility.actual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'"
                  @click="passwordVisibility.actual = !passwordVisibility.actual"
                >
                  <component :is="passwordVisibility.actual ? EyeOff : Eye" :size="18" />
                </button>
              </div>
              <small v-if="passwordErrors.password_actual">{{ passwordErrors.password_actual }}</small>
            </div>

            <div class="field-group">
              <label for="password-nuevo">Nueva contraseña</label>
              <div class="password-input" :class="{ invalid: passwordErrors.password_nuevo }">
                <input
                  id="password-nuevo"
                  v-model="passwordForm.password_nuevo"
                  :type="passwordVisibility.nuevo ? 'text' : 'password'"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="reveal-button"
                  :aria-label="passwordVisibility.nuevo ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'"
                  @click="passwordVisibility.nuevo = !passwordVisibility.nuevo"
                >
                  <component :is="passwordVisibility.nuevo ? EyeOff : Eye" :size="18" />
                </button>
              </div>
              <small v-if="passwordErrors.password_nuevo">{{ passwordErrors.password_nuevo }}</small>
            </div>

            <div class="field-group">
              <label for="password-confirmation">Confirmar nueva contraseña</label>
              <div class="password-input" :class="{ invalid: passwordErrors.password_nuevo_confirmation }">
                <input
                  id="password-confirmation"
                  v-model="passwordForm.password_nuevo_confirmation"
                  :type="passwordVisibility.confirmation ? 'text' : 'password'"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="reveal-button"
                  :aria-label="passwordVisibility.confirmation ? 'Ocultar confirmación' : 'Mostrar confirmación'"
                  @click="passwordVisibility.confirmation = !passwordVisibility.confirmation"
                >
                  <component :is="passwordVisibility.confirmation ? EyeOff : Eye" :size="18" />
                </button>
              </div>
              <small v-if="passwordErrors.password_nuevo_confirmation">{{ passwordErrors.password_nuevo_confirmation }}</small>
            </div>

            <p v-if="passwordError" class="form-message error">
              <AlertCircle :size="18" />
              {{ passwordError }}
            </p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" :disabled="isSavingPassword" @click="closePasswordModal">
                Cancelar
              </button>
              <button class="save-button" type="submit" :disabled="isSavingPassword">
                <Loader2 v-if="isSavingPassword" class="spin" :size="18" />
                <KeyRound v-else :size="18" />
                {{ isSavingPassword ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.profile-page {
  display: grid;
  place-items: start center;
}

.profile-card {
  width: min(860px, 100%);
  padding: 28px;
  border-radius: var(--hotel-radius);
  background: #fff;
  border: 1px solid rgba(230, 223, 210, 0.82);
  box-shadow: var(--hotel-shadow-soft);
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--hotel-border);
}

.profile-title {
  flex: 1;
  min-width: 0;
}

.profile-avatar {
  flex: 0 0 auto;
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    linear-gradient(135deg, rgba(201, 169, 106, 0.92), rgba(111, 143, 114, 0.88)),
    url('../assets/hero.png') center / cover;
  color: #fff;
  box-shadow: 0 16px 34px rgba(31, 41, 51, 0.16);
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

.profile-head p:last-child {
  margin: 0;
  color: var(--hotel-muted);
}

.password-trigger,
.save-button,
.secondary-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.password-trigger {
  flex: 0 0 auto;
  padding: 0 16px;
  color: #fff;
  background: linear-gradient(135deg, #9a6b2f, #6f8f72);
  box-shadow: 0 14px 28px rgba(154, 107, 47, 0.18);
}

.password-trigger:hover,
.save-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.profile-row {
  padding: 15px;
  display: flex;
  gap: 12px;
  border-radius: 8px;
  background: #fbf8f1;
  color: var(--hotel-green-dark);
}

.profile-row span,
.profile-row strong {
  display: block;
}

.profile-row span {
  margin-bottom: 4px;
  color: var(--hotel-muted);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.profile-row strong {
  color: var(--hotel-ink);
  word-break: break-word;
}

.floating-message,
.form-message {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 16px 0 0;
  font-weight: 800;
}

.floating-message.success {
  width: min(860px, 100%);
  padding: 14px 16px;
  border: 1px solid rgba(111, 143, 114, 0.24);
  border-radius: 8px;
  color: #416344;
  background: #f2f8ef;
}

.form-message.error {
  padding: 12px 14px;
  border: 1px solid rgba(170, 72, 54, 0.22);
  border-radius: 8px;
  color: #9d3f31;
  background: #fff3ef;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(31, 41, 51, 0.46);
  backdrop-filter: blur(6px);
}

.password-modal {
  width: min(520px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 26px;
  border: 1px solid rgba(230, 223, 210, 0.9);
  border-radius: var(--hotel-radius);
  background: #fff;
  box-shadow: 0 28px 80px rgba(31, 41, 51, 0.28);
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--hotel-border);
}

.modal-head h3 {
  margin: 0;
  color: var(--hotel-ink);
  font-size: 24px;
}

.icon-button,
.reveal-button {
  display: inline-grid;
  place-items: center;
  border: 0;
  color: var(--hotel-green-dark);
  background: transparent;
  cursor: pointer;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fbf8f1;
}

.icon-button:disabled,
.save-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.password-form {
  display: grid;
  gap: 16px;
}

.field-group {
  display: grid;
  gap: 7px;
}

.field-group label {
  color: var(--hotel-ink);
  font-size: 13px;
  font-weight: 900;
}

.field-group small {
  color: #9d3f31;
  font-weight: 800;
}

.password-input {
  min-height: 48px;
  display: grid;
  grid-template-columns: 1fr 44px;
  align-items: center;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: #fffdf9;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.password-input:focus-within {
  border-color: rgba(154, 107, 47, 0.55);
  box-shadow: 0 0 0 4px rgba(201, 169, 106, 0.16);
}

.password-input.invalid {
  border-color: rgba(157, 63, 49, 0.6);
}

.password-input input {
  min-width: 0;
  width: 100%;
  height: 46px;
  padding: 0 0 0 14px;
  border: 0;
  outline: 0;
  color: var(--hotel-ink);
  background: transparent;
  font: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 4px;
}

.secondary-button {
  padding: 0 18px;
  color: var(--hotel-green-dark);
  background: #fbf8f1;
  border: 1px solid var(--hotel-border);
}

.save-button {
  min-width: 132px;
  padding: 0 18px;
  color: #fff;
  background: linear-gradient(135deg, #9a6b2f, #6f8f72);
  box-shadow: 0 14px 28px rgba(154, 107, 47, 0.18);
}

.spin {
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 680px) {
  .profile-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .password-trigger {
    width: 100%;
  }

  .modal-backdrop {
    padding: 14px;
    place-items: end center;
  }

  .password-modal {
    max-height: calc(100vh - 28px);
    padding: 22px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .secondary-button,
  .save-button {
    width: 100%;
  }
}
</style>
