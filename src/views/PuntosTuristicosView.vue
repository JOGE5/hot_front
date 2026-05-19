<script setup>
import { reactive } from 'vue';
import { MapPinned, ArrowRight } from 'lucide-vue-next';

const touristImages = import.meta.glob('../assets/puntos-turisticos/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

function touristImage(fileName) {
  return touristImages[`../assets/puntos-turisticos/${fileName}`] || '';
}

const imageErrors = reactive({});

const puntosTuristicos = [
  {
    title: 'Plaza principal de Sorata',
    category: 'Centro histórico',
    description:
      'Un punto ideal para caminar, tomar fotografías y conocer el ritmo tranquilo del valle.',
    recommendation: 'Ideal para una caminata ligera y fotografías.',
    image: touristImage('plaza-sorata.jpg'),
  },
  {
    title: 'Gruta de San Pedro',
    category: 'Naturaleza',
    description:
      'Cueva natural con laguna interior, una visita clásica para quienes buscan naturaleza y aventura suave.',
    recommendation: 'Recomendada para una salida de medio día.',
    image: touristImage('gruta-san-pedro.jpg'),
  },
  {
    title: 'Laguna Glaciar',
    category: 'Aventura',
    description:
      'Paisaje de altura con vistas memorables para huéspedes que disfrutan caminatas exigentes.',
    recommendation: 'Consultar clima y guía local antes de salir.',
    image: touristImage('laguna-glaciar.jpg'),
  },
  {
    title: 'Mirador de Sorata',
    category: 'Vista panorámica',
    description:
      'Espacio perfecto para apreciar el entorno montañoso y cerrar la tarde con calma.',
    recommendation: 'Ideal al atardecer.',
    image: touristImage('mirador-sorata.jpg'),
  },
];
</script>

<template>
  <section class="tourism-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Sorata</p>
        <h2>Puntos turísticos</h2>
        <p>Descubre lugares recomendados cerca de Hotel La Mansión para complementar tu estadía.</p>
      </div>
      <div class="head-icon">
        <MapPinned :size="24" />
      </div>
    </div>

    <div class="tourism-list">
      <article v-for="point in puntosTuristicos" :key="point.title" class="tour-card">
        <div class="tour-image">
          <img
            v-if="point.image && !imageErrors[point.title]"
            :src="point.image"
            :alt="point.title"
            @error="imageErrors[point.title] = true"
          />
          <span v-else>Imagen no disponible</span>
        </div>

        <div class="tour-content">
          <span class="category-badge">{{ point.category }}</span>
          <h3>{{ point.title }}</h3>
          <p>{{ point.description }}</p>
          <strong>{{ point.recommendation }}</strong>

          <button type="button">
            Ver recomendación
            <ArrowRight :size="16" />
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.tourism-page {
  display: grid;
  gap: 22px;
}

.page-head,
.tour-card {
  border-radius: var(--hotel-radius);
  background: #fff;
  border: 1px solid rgba(230, 223, 210, 0.82);
  box-shadow: 0 14px 35px rgba(31, 41, 51, 0.1);
}

.page-head {
  padding: 24px;
  display: flex;
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
  max-width: 760px;
  margin: 0;
  color: var(--hotel-muted);
  line-height: 1.6;
}

.head-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--hotel-gold-soft);
  color: #8a5d1f;
  flex: 0 0 auto;
}

.tourism-list {
  display: grid;
  gap: 24px;
}

.tour-card {
  overflow: hidden;
  display: grid;
  grid-template-columns: 40% minmax(0, 1fr);
  min-height: 280px;
}

.tour-image {
  width: 100%;
  height: 100%;
  min-height: 280px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(201, 169, 106, 0.9), rgba(111, 143, 114, 0.78)),
    url('../assets/hero.png') center / cover;
  color: #fff;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.tour-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.tour-image span {
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(31, 41, 51, 0.38);
  backdrop-filter: blur(4px);
}

.tour-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.category-badge {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(111, 143, 114, 0.14);
  color: var(--hotel-green-dark);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.tour-content h3 {
  margin: 0 0 12px;
  color: var(--hotel-ink);
  font-size: 29px;
  line-height: 1.15;
}

.tour-content p {
  max-width: 720px;
  margin: 0 0 18px;
  color: var(--hotel-muted);
  font-size: 16px;
  line-height: 1.72;
}

.tour-content strong {
  display: block;
  margin-bottom: 22px;
  color: #8a5d1f;
  font-size: 15px;
}

button {
  min-height: 44px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--hotel-green), var(--hotel-green-dark));
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(78, 111, 82, 0.2);
}

@media (max-width: 920px) {
  .tour-card {
    grid-template-columns: 1fr;
  }

  .tour-image {
    height: 220px;
    min-height: 220px;
  }

  .tour-image img {
    height: 220px;
  }
}

@media (max-width: 680px) {
  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .tour-content {
    padding: 24px;
  }

  .tour-content h3 {
    font-size: 23px;
  }
}
</style>
