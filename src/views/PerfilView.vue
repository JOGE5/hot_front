<script setup>
import { computed } from 'vue';
import { Mail, IdCard, Phone, UserRound } from 'lucide-vue-next';

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
</script>

<template>
  <section class="profile-page">
    <article class="profile-card">
      <div class="profile-head">
        <div class="profile-avatar">
          <UserRound :size="34" />
        </div>
        <div>
          <p class="eyebrow">Mi cuenta</p>
          <h2>{{ fullName }}</h2>
          <p>Datos registrados para tu experiencia como huésped.</p>
        </div>
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

.profile-avatar {
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

@media (max-width: 680px) {
  .profile-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
