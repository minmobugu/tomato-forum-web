<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import SidebarCard from '../../components/common/SidebarCard.vue'
import CommentList from '../../components/post/CommentList.vue'
import { useCommunityStore } from '../../stores/community'
import type { Post } from '../../types/community'

const route = useRoute()
const store = useCommunityStore()
const { comments, interactions, posts } = storeToRefs(store)
const post = ref<Post | null>(null)

const postId = computed(() => Number(route.params.id))
const relatedPosts = computed(() => posts.value.filter((item) => item.id !== postId.value).slice(0, 2))

onMounted(async () => {
  await store.bootstrapHome()
  post.value = await store.loadPostDetail(postId.value)
})
</script>

<template>
  <div v-if="post" class="page-grid post-detail-layout">
    <section class="content-stack post-detail-page">
      <article class="panel-card post-detail-card post-detail-card--rich">
        <img :src="post.cover" :alt="post.title" class="post-detail-card__cover" />
        <div class="post-detail-card__body">
          <div class="post-detail-card__meta">
            <span class="pill">{{ post.topic }}</span>
            <span>{{ post.game }}</span>
            <span>{{ post.publishTime }}</span>
            <span>{{ post.readingTime }}</span>
          </div>
          <h2>{{ post.title }}</h2>
          <div class="post-detail-card__author">
            <div class="post-card__avatar-wrap">
              <img :src="post.author.avatar" :alt="post.author.name" />
              <span v-if="post.author.isOnline" class="post-card__online-dot"></span>
            </div>
            <div>
              <strong>{{ post.author.name }}</strong>
              <span>{{ post.author.level }}</span>
            </div>
          </div>
          <div class="post-detail-toolbar">
            <button
              class="post-action-button"
              :class="{ 'post-action-button--active': interactions[post.id]?.liked }"
              type="button"
              @click="store.toggleLike(post.id)"
            >
              {{ interactions[post.id]?.liked ? '已点赞' : '点赞' }}
            </button>
            <button
              class="post-action-button"
              :class="{ 'post-action-button--active': interactions[post.id]?.favorited }"
              type="button"
              @click="store.toggleFavorite(post.id)"
            >
              {{ interactions[post.id]?.favorited ? '已收藏' : '收藏' }}
            </button>
            <button class="post-action-button" type="button">分享</button>
          </div>
          <section v-if="post.media.length" class="post-detail-media">
            <div v-if="post.media.some((item) => item.type === 'image')" class="post-detail-media__gallery">
              <img
                v-for="item in post.media.filter((mediaItem) => mediaItem.type === 'image')"
                :key="item.id"
                :src="item.url"
                :alt="item.name"
                class="post-detail-media__image"
              />
            </div>
            <div v-if="post.media.some((item) => item.type === 'video')" class="post-detail-media__videos">
              <article
                v-for="item in post.media.filter((mediaItem) => mediaItem.type === 'video')"
                :key="item.id"
                class="post-detail-media__video-card"
              >
                <video :poster="item.poster" :src="item.url" controls preload="metadata"></video>
                <span>{{ item.name }}</span>
              </article>
            </div>
          </section>
          <div class="article-body">
            <p v-for="paragraph in post.content" :key="paragraph">{{ paragraph }}</p>
          </div>
          <div class="tag-list">
            <span v-for="tag in post.tags" :key="tag"># {{ tag }}</span>
          </div>
          <div class="post-detail-card__metrics">
            <strong>点赞 {{ post.likes }}</strong>
            <span>评论 {{ post.comments }}</span>
            <span>收藏 {{ post.favorites }}</span>
            <span>{{ post.views }} 浏览</span>
          </div>
        </div>
      </article>

      <CommentList :comments="comments" />
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="作者名片" description="内容与社区身份一览">
        <div class="detail-author-card">
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
          <div class="metric-list metric-list--single">
            <div>
              <strong>{{ post.views }}</strong>
              <span>总浏览</span>
            </div>
            <div>
              <strong>{{ post.likes }}</strong>
              <span>本帖点赞</span>
            </div>
          </div>
        </div>
      </SidebarCard>

      <SidebarCard title="相关推荐" description="继续看看同圈层的热门内容">
        <div class="related-posts">
          <RouterLink v-for="item in relatedPosts" :key="item.id" :to="`/post/${item.id}`" class="related-post-link">
            <strong>{{ item.title }}</strong>
            <span>{{ item.game }} · {{ item.publishTime }}</span>
          </RouterLink>
        </div>
      </SidebarCard>
    </aside>
  </div>
</template>
