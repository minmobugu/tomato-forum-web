<script setup lang="ts">
import { computed } from 'vue'

import type { Post, PostInteractionState } from '../../types/community'

const props = defineProps<{
  post: Post
  interaction?: PostInteractionState
}>()

const emit = defineEmits<{
  like: [postId: number]
  favorite: [postId: number]
}>()

const actionText = computed(() => ({
  like: props.interaction?.liked ? '已点赞' : '点赞',
  favorite: props.interaction?.favorited ? '已收藏' : '收藏',
}))

function onLikeClick() {
  emit('like', props.post.id)
}

function onFavoriteClick() {
  emit('favorite', props.post.id)
}
</script>

<template>
  <article class="post-card panel-card">
    <RouterLink :to="`/post/${post.id}`" class="post-card__media">
      <img :src="post.cover" :alt="post.title" class="post-card__cover" />
      <div class="post-card__cover-overlay"></div>
      <div v-if="post.featured" class="post-card__featured">编辑推荐</div>
      <div class="post-card__floating-stats">
        <span>{{ post.views }} 浏览</span>
        <span>{{ post.readingTime }}</span>
      </div>
    </RouterLink>

    <div class="post-card__content">
      <div class="post-card__meta">
        <span class="pill">{{ post.topic }}</span>
        <span>{{ post.game }}</span>
        <span>{{ post.publishTime }}</span>
      </div>

      <RouterLink :to="`/post/${post.id}`" class="post-card__title-link">
        <h3>{{ post.title }}</h3>
      </RouterLink>

      <p>{{ post.summary }}</p>

      <div class="tag-list">
        <span v-for="tag in post.tags" :key="tag"># {{ tag }}</span>
      </div>

      <div class="post-card__footer">
        <div class="post-card__author">
          <div class="post-card__avatar-wrap">
            <img :src="post.author.avatar" :alt="post.author.name" />
            <span v-if="post.author.isOnline" class="post-card__online-dot"></span>
          </div>
          <div>
            <strong>{{ post.author.name }}</strong>
            <span>{{ post.author.level }}</span>
          </div>
        </div>

        <div class="post-card__actions">
          <button
            class="post-action-button"
            :class="{ 'post-action-button--active': interaction?.liked }"
            type="button"
            @click="onLikeClick"
          >
            {{ actionText.like }}
          </button>
          <button
            class="post-action-button"
            :class="{ 'post-action-button--active': interaction?.favorited }"
            type="button"
            @click="onFavoriteClick"
          >
            {{ actionText.favorite }}
          </button>
        </div>
      </div>

      <div class="post-card__metrics">
        <span>赞 {{ post.likes }}</span>
        <span>评 {{ post.comments }}</span>
        <span>藏 {{ post.favorites }}</span>
      </div>
    </div>
  </article>
</template>
