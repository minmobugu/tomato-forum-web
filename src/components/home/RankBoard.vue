<script setup lang="ts">
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
    <div class="section-header rank-board__header">
      <div>
        <h3>{{ title }}</h3>
        <p>社区实时热度追踪</p>
      </div>
    </div>

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
