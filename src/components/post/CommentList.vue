<script setup lang="ts">
import type { CommentItem } from '../../types/community'

defineProps<{
  comments: CommentItem[]
}>()
</script>

<template>
  <section class="panel-card comments-card">
    <div class="section-header comments-card__title">
      <div>
        <h2>评论区</h2>
        <p>来自社区玩家的热门讨论</p>
      </div>
      <button class="ghost-button" type="button">参与讨论</button>
    </div>

    <div class="comments-card__list">
      <article v-for="comment in comments" :key="comment.id" class="comment-item panel-card panel-card--soft">
        <div class="comment-item__avatar-wrap">
          <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-item__avatar" />
          <span v-if="comment.author.isOnline" class="post-card__online-dot"></span>
        </div>
        <div class="comment-item__content">
          <div class="comment-item__header">
            <strong>{{ comment.author.name }}</strong>
            <span>{{ comment.author.level }}</span>
            <time>{{ comment.publishTime }}</time>
          </div>
          <p>{{ comment.content }}</p>
          <div class="comment-item__footer">
            <small>点赞 {{ comment.likes }}</small>
            <button class="text-action" type="button">回复</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
