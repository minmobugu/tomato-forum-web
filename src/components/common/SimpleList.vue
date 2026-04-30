<script setup lang="ts">
defineProps<{
  items: string[]
}>()
</script>

<template>
  <ul class="simple-list">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>
