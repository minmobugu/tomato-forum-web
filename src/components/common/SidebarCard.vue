<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="sidebar-card panel-card">
    <div class="sidebar-card__header">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>
