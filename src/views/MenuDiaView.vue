<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const menu = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await api.get('/menu');
    menu.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar el menú';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <h1>Menú del día</h1>

    <div v-if="loading" class="spinner">Cargando...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="!menu" class="empty">
      <p>No hay menú publicado todavía.</p>
    </div>

    <div v-else class="menu">
      <p><strong>Fecha:</strong> {{ menu.fecha }}</p>

      <h2>Entrada</h2>
      <p>{{ menu.entrada }}</p>

      <h2>Plato fuerte</h2>
      <p>{{ menu.plato_fuerte }}</p>

      <h2>Postre</h2>
      <p>{{ menu.postre }}</p>

      <h2>Precio</h2>
      <p>${{ menu.precio }}</p>
    </div>
  </div>
</template>

<style scoped>
.menu {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 24px auto;
}

.menu h2 {
  margin-top: 16px;
  color: #333;
  font-size: 1.2rem;
}
</style>