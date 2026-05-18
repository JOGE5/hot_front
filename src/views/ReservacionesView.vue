<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const router = useRouter();

const reservaciones = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await api.get('/reservaciones');
    reservaciones.value = response.data;
  } catch (err) {
    error.value = 'Error al cargar reservaciones';
  } finally {
    loading.value = false;
  }
});

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString();
};
</script>

<template>
  <div class="page">
    <h1>Mis reservaciones</h1>

    <button
      @click="$router.push({ name: 'crear-reservacion' })"
      class="button primary"
    >
      Crear nueva reservación
    </button>

    <div v-if="loading" class="spinner">Cargando...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="reservaciones.length === 0" class="empty">
      <p>No tienes reservaciones.</p>
    </div>

    <div v-else class="reservaciones-list">
      <div
        v-for="r in reservaciones"
        :key="r.id"
        class="reservation-card"
      >
        <p><strong>Habitación:</strong> {{ r.habitacion?.numero }}</p>
        <p><strong>Llegada:</strong> {{ formatFecha(r.fecha_llegada) }}</p>
        <p><strong>Salida:</strong> {{ formatFecha(r.fecha_salida) }}</p>
        <p>
          <strong>Precio total:</strong>
          ${{ (r.habitacion?.precio || 0) * (r.dias || 0) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button {
  display: inline-block;
  padding: 10px 16px;
  margin-right: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
}

.primary {
  background: #2c3e50;
  color: white;
}

.reservation-card {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty,
.loading,
.error {
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
}
</style>