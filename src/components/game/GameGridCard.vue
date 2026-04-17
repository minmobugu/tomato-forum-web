<script setup lang="ts">
import type { Game } from '../../types/community'

defineProps<{
  game: Game
}>()
</script>

<template>
  <article class="game-grid-card panel-card">
    <div class="game-grid-card__media">
      <img :src="game.cover" :alt="game.name" class="game-grid-card__cover" />
      <div class="game-grid-card__cover-overlay"></div>
      <div class="game-grid-card__featured">
        <span class="pill">{{ game.status }}</span>
        <span>{{ game.genre }}</span>
      </div>
      <div class="game-grid-card__floating-stats">
        <span>{{ game.followers }} 关注</span>
        <span>热度 {{ game.heat }}</span>
      </div>
    </div>

    <div class="game-grid-card__body">
      <h3>{{ game.name }}</h3>
      <p>{{ game.summary }}</p>
      <div class="tag-list">
        <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>
