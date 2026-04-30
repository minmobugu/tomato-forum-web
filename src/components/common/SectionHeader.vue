<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle: string
  level?: 'h2' | 'h3'
}>(), {
  level: 'h2',
})
</script>

<template>
  <div class="section-header">
    <div>
      <component :is="level">{{ title }}</component>
      <p>{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>
