<script setup>
import { ref } from 'vue';
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
          <input v-model="email" type="email" required />
        </label>

        <label>
          Contraseña
          <input v-model="password" type="password" required />
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
  background:
    linear-gradient(rgba(31, 41, 51, 0.55), rgba(31, 41, 51, 0.65)),
    linear-gradient(135deg, #c9a96a, #f4efe7);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  background: #fffaf0;
  border-radius: 28px;
  padding: 34px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
}

.brand {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  width: 58px;
  height: 58px;
  margin: 0 auto 12px;
  border-radius: 18px;
  background: #1f2933;
  color: #c9a96a;
  display: grid;
  place-items: center;
  font-weight: 900;
}

.brand p {
  margin: 0;
  color: #9a6b2f;
  font-weight: 700;
}

.brand h1 {
  margin: 6px 0 0;
  color: #1f2933;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  color: #334155;
  font-weight: 700;
  font-size: 14px;
}

input {
  margin-top: 7px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d7c7aa;
  border-radius: 14px;
  padding: 12px 14px;
  background: #fff;
}

button {
  margin-top: 8px;
  border: none;
  border-radius: 16px;
  padding: 13px 16px;
  background: #1f2933;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
}

.error {
  color: #b42318;
  margin: 0;
  font-size: 14px;
}
</style>