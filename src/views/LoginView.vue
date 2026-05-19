<script setup>
import { ref } from 'vue';
import { Mail, LockKeyhole } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { auth } from '../stores/auth';

const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function login() {
  error.value = '';
  loading.value = true;

  try {
    await auth.login({
      email: email.value,
      password: password.value,
    });

    router.push('/panel');
  } catch (e) {
    error.value = 'Credenciales incorrectas o usuario no autorizado.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <div class="brand">
        <div class="logo">LM</div>
        <p>Hotel Club Campestre</p>
        <h1>La Mansión</h1>
      </div>

      <form @submit.prevent="login">
        <label>
          Correo electrónico
          <span class="field">
            <Mail :size="18" />
            <input v-model="email" type="email" required />
          </span>
        </label>

        <label>
          Contraseña
          <span class="field">
            <LockKeyhole :size="18" />
            <input v-model="password" type="password" required />
          </span>
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar al panel' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(110deg, rgba(246, 239, 226, 0.92), rgba(238, 238, 238, 0.72)),
    url('../assets/hero.png') center / cover;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 34px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(230, 223, 210, 0.92);
  box-shadow: 0 28px 70px rgba(31, 41, 51, 0.18);
  backdrop-filter: blur(8px);
}

.brand {
  margin-bottom: 28px;
  text-align: center;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--hotel-ink), #3a454f);
  color: var(--hotel-gold);
  font-weight: 900;
  box-shadow: 0 14px 30px rgba(31, 41, 51, 0.18);
}

.brand p {
  margin: 0;
  color: #9a6b2f;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand h1 {
  margin: 6px 0 0;
  color: var(--hotel-ink);
  font-size: 30px;
  line-height: 1.15;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  color: var(--hotel-ink-soft);
  font-size: 14px;
  font-weight: 800;
}

.field {
  min-height: 46px;
  margin-top: 7px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--hotel-border);
  border-radius: 8px;
  background: #fff;
  color: var(--hotel-muted);
}

input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--hotel-ink);
}

input:focus {
  outline: 0;
}

.field:focus-within {
  border-color: var(--hotel-green);
  box-shadow: 0 0 0 3px rgba(111, 143, 114, 0.16);
}

button {
  min-height: 48px;
  margin-top: 8px;
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

.error {
  margin: 0;
  padding: 11px 12px;
  border-radius: 8px;
  background: #fff0ed;
  color: #b42318;
  font-size: 14px;
  font-weight: 700;
}
</style>
