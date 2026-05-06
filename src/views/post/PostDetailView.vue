<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import SidebarCard from '../../components/common/SidebarCard.vue'
import MetricList from '../../components/common/MetricList.vue'
import TagList from '../../components/common/TagList.vue'
import CommentList from '../../components/post/CommentList.vue'
import PostAuthorSummary from '../../components/post/PostAuthorSummary.vue'
import PostInteractionActions from '../../components/post/PostInteractionActions.vue'
import { useCommunityStore } from '../../stores/community'
import type { Post } from '../../types/community'

const route = useRoute()
const store = useCommunityStore()
const { comments, interactions, isSubmittingComment, posts } = storeToRefs(store)
const post = ref<Post | null>(null)

const postId = computed(() => Number(route.params.id))
const relatedPosts = computed(() => posts.value.filter((item) => item.id !== postId.value).slice(0, 2))

async function loadCurrentPost() {
  await store.bootstrapHome()
  post.value = await store.loadPostDetail(postId.value)
}

async function handleCommentSubmit(content: string) {
  if (!post.value) {
    return
  }

  await store.submitComment(post.value.id, content)
  post.value = posts.value.find((item) => item.id === post.value?.id) ?? post.value
}

async function handleReplySubmit(commentId: number, content: string) {
  if (!post.value) {
    return
  }

  await store.submitReply(post.value.id, commentId, content)
  post.value = posts.value.find((item) => item.id === post.value?.id) ?? post.value
}

onMounted(loadCurrentPost)
watch(postId, () => {
  void loadCurrentPost()
})
</script>

<template>
  <div v-if="post" class="page-grid post-detail-layout">
    <section class="content-stack post-detail-page">
      <article class="panel-card post-detail-card post-detail-card--rich">
        <img :src="post.cover" :alt="post.title" class="post-detail-card__cover" />
        <div class="post-detail-card__body">
          <div class="post-detail-card__meta">
            <span class="pill">{{ post.channel }}</span>
            <span>{{ post.game }}</span>
            <span>{{ post.publishTime }}</span>
            <span>{{ post.readingTime }}</span>
          </div>
          <h2>{{ post.title }}</h2>
          <PostAuthorSummary class="post-detail-card__author" :author="post.author" />
          <div class="post-detail-toolbar">
            <PostInteractionActions
              :liked="interactions[post.id]?.liked"
              :disliked="interactions[post.id]?.disliked"
              :favorited="interactions[post.id]?.favorited"
              show-share
              @like="store.toggleLike(post.id)"
              @dislike="store.toggleDislike(post.id)"
              @favorite="store.toggleFavorite(post.id)"
            />
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
          <TagList :items="post.tags" prefix="#" />
          <MetricList
            class="post-detail-card__metrics"
            :items="[
              { label: '点赞', value: String(post.likes) },
              { label: '点踩', value: String(post.dislikes) },
              { label: '评论', value: String(post.comments) },
              { label: '收藏', value: String(post.favorites) },
              { label: '浏览', value: `${post.views}` },
            ]"
          />
        </div>
      </article>

      <CommentList
        :comments="comments"
        :is-submitting="isSubmittingComment"
        @submit="handleCommentSubmit"
        @reply="handleReplySubmit"
      />
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="作者名片" description="内容与社区身份一览">
        <div class="detail-author-card">
          <PostAuthorSummary :author="post.author" />
          <MetricList
            :items="[
              { label: '总浏览', value: post.views },
              { label: '本帖点赞', value: String(post.likes) },
              { label: '本帖点踩', value: String(post.dislikes) },
            ]"
            single-column
          />
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
