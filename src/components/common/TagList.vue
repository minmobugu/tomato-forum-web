<script setup lang="ts">
defineProps<{
  items: string[]
  prefix?: string
}>()
</script>

<template>
  <div class="tag-list">
    <span v-for="item in items" :key="item">{{ prefix ? `${prefix} ${item}` : item }}</span>
  </div>
</template>
