<script setup lang="ts">
import TagList from '../common/TagList.vue'
import PostAuthorSummary from './PostAuthorSummary.vue'
import PostInteractionActions from './PostInteractionActions.vue'
import type { Post, PostInteractionState } from '../../types/community'

const props = defineProps<{
  post: Post
  interaction?: PostInteractionState
}>()

const emit = defineEmits<{
  like: [postId: number]
  favorite: [postId: number]
}>()

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

      <TagList :items="post.tags" prefix="#" />

      <div class="post-card__footer">
        <PostAuthorSummary :author="post.author" />

        <PostInteractionActions
          :liked="interaction?.liked"
          :favorited="interaction?.favorited"
          @like="onLikeClick"
          @favorite="onFavoriteClick"
        />
      </div>

      <div class="post-card__metrics">
        <span>赞 {{ post.likes }}</span>
        <span>评 {{ post.comments }}</span>
        <span>藏 {{ post.favorites }}</span>
      </div>
    </div>
  </article>
</template>
