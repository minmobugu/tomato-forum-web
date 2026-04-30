<script setup lang="ts">
import SectionHeader from '../common/SectionHeader.vue'

defineProps<{
  title: string
  items: Array<{
    id: number
    title: string
    subtitle: string
    value: string
    trend: string
  }>
}>()
</script>

<template>
  <section class="rank-board panel-card">
    <SectionHeader class="rank-board__header" :title="title" subtitle="社区实时热度追踪" level="h3" />

    <div class="rank-board__list">
      <article v-for="(item, index) in items" :key="item.id" class="rank-item">
        <span class="rank-item__index">0{{ index + 1 }}</span>
        <div class="rank-item__body">
          <strong>{{ item.title }}</strong>
          <p>{{ item.subtitle }}</p>
        </div>
        <div class="rank-item__meta">
          <span>{{ item.value }}</span>
          <small>{{ item.trend }}</small>
        </div>
      </article>
    </div>
  </section>
</template>
