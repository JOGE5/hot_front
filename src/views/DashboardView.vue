<template>
  <section>
    <div class="hero">
      <p class="eyebrow">Bienvenido</p>
      <h1>Panel del huésped</h1>
      <p>
        Consulta habitaciones disponibles, revisa tus reservaciones y explora el menú del día.
      </p>
    </div>

    <div class="grid">
      <RouterLink to="/panel/habitaciones" class="card">
        <h3>Habitaciones</h3>
        <p>Consulta disponibilidad y precios.</p>
      </RouterLink>

      <RouterLink to="/panel/reservaciones" class="card">
        <h3>Mis reservaciones</h3>
        <p>Revisa el estado de tus estadías.</p>
      </RouterLink>

      <RouterLink to="/panel/menu-del-dia" class="card">
        <h3>Menú del día</h3>
        <p>Explora la oferta gastronómica publicada.</p>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, #fffaf0, #eadcc4);
  border-radius: 26px;
  padding: 34px;
  box-shadow: 0 14px 35px rgba(31, 41, 51, 0.08);
}

.eyebrow {
  color: #9a6b2f;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  font-size: 36px;
  color: #1f2933;
}

.hero p {
  max-width: 680px;
  color: #5c6670;
}

.grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.card {
  background: #fff;
  border-radius: 22px;
  padding: 24px;
  color: #1f2933;
  text-decoration: none;
  box-shadow: 0 10px 28px rgba(31, 41, 51, 0.08);
}

.card h3 {
  margin: 0 0 8px;
}

.card p {
  margin: 0;
  color: #667085;
}
</style>X