<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string
    value: string
  }>
  singleColumn?: boolean
}>()
</script>

<template>
  <div class="metric-list" :class="{ 'metric-list--single': singleColumn }">
    <div v-for="item in items" :key="item.label">
      <strong>{{ item.value }}</strong>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>
