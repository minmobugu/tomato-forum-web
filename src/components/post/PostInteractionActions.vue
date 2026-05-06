<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  liked?: boolean
  disliked?: boolean
  favorited?: boolean
  showShare?: boolean
}>()

const emit = defineEmits<{
  like: []
  dislike: []
  favorite: []
  share: []
}>()

const actionText = computed(() => ({
  like: props.liked ? '已点赞' : '点赞',
  dislike: props.disliked ? '已点踩' : '点踩',
  favorite: props.favorited ? '已收藏' : '收藏',
}))
</script>

<template>
  <div class="post-card__actions">
    <button
      class="post-action-button"
      :class="{ 'post-action-button--active': liked }"
      type="button"
      @click="emit('like')"
    >
      {{ actionText.like }}
    </button>
    <button
      class="post-action-button"
      :class="{ 'post-action-button--active': disliked }"
      type="button"
      @click="emit('dislike')"
    >
      {{ actionText.dislike }}
    </button>
    <button
      class="post-action-button"
      :class="{ 'post-action-button--active': favorited }"
      type="button"
      @click="emit('favorite')"
    >
      {{ actionText.favorite }}
    </button>
    <button v-if="showShare" class="post-action-button" type="button" @click="emit('share')">分享</button>
  </div>
</template>
