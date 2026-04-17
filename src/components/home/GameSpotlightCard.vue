<script setup lang="ts">
import type { Game } from '../../types/community'

defineProps<{
  game: Game
}>()
</script>

<template>
  <article class="spotlight-card panel-card">
    <img :src="game.cover" :alt="game.name" class="spotlight-card__cover" />
    <div class="spotlight-card__body">
      <div class="spotlight-card__meta">
        <span class="pill">{{ game.status }}</span>
        <span>{{ game.genre }}</span>
      </div>
      <h3>{{ game.name }}</h3>
      <p>{{ game.summary }}</p>
      <div class="spotlight-card__footer">
        <strong>{{ game.followers }}</strong>
        <span>热度 {{ game.heat }}</span>
      </div>
    </div>
  </article>
</template>
