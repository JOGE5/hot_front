<script setup>
import SidebarHuesped from '../components/SidebarHuesped.vue';
</script>

<template>
  <div class="layout">
    <SidebarHuesped />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  background: #f4efe7;
}

.content {
  flex: 1;
  padding: 28px;
}
</style>