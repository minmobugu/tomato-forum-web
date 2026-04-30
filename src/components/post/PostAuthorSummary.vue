<script setup lang="ts">
import type { Author } from '../../types/community'

defineProps<{
  author: Author
}>()
</script>

<template>
  <div class="post-card__author">
    <div class="post-card__avatar-wrap">
      <img :src="author.avatar" :alt="author.name" />
      <span v-if="author.isOnline" class="post-card__online-dot"></span>
    </div>
    <div>
      <strong>{{ author.name }}</strong>
      <span>{{ author.level }}</span>
    </div>
  </div>
</template>
