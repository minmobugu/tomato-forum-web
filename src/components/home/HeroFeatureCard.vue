<script setup lang="ts">
import type { HeroFeature } from '../../types/community'

defineProps<{
  feature: HeroFeature
}>()
</script>

<template>
  <article class="hero-feature-card panel-card">
    <img :src="feature.cover" :alt="feature.title" class="hero-feature-card__cover" />
    <div class="hero-feature-card__overlay"></div>
    <div class="hero-feature-card__content">
      <span class="pill">{{ feature.badge }}</span>
      <h2>{{ feature.title }}</h2>
      <p>{{ feature.subtitle }}</p>
      <div class="hero-feature-card__metrics">
        <div v-for="metric in feature.metrics" :key="metric.label">
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>
        </div>
      </div>
    </div>
  </article>
</template>
