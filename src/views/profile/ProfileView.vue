<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import SidebarCard from '../../components/common/SidebarCard.vue'
import PostCard from '../../components/home/PostCard.vue'
import ProfileSummaryCard from '../../components/profile/ProfileSummaryCard.vue'
import { useCommunityStore } from '../../stores/community'

const store = useCommunityStore()
const { interactions, posts, profile } = storeToRefs(store)
const profileTab = ref<'帖子' | '收藏' | '互动'>('帖子')

const recentPosts = computed(() => posts.value.slice(0, 2))
const tabOptions: Array<'帖子' | '收藏' | '互动'> = ['帖子', '收藏', '互动']

onMounted(async () => {
  await Promise.all([store.loadProfile(), store.bootstrapHome()])
})
</script>

<template>
  <div v-if="profile" class="page-grid profile-page">
    <section class="content-stack">
      <ProfileSummaryCard :profile="profile" />

      <section class="panel-card profile-tabs-panel">
        <div class="feed-tabs">
          <button
            v-for="tab in tabOptions"
            :key="tab"
            class="feed-tabs__item"
            :class="{ 'feed-tabs__item--active': tab === profileTab }"
            type="button"
            @click="profileTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </section>

      <section v-if="profileTab === '帖子'" class="content-section">
        <div class="section-header">
          <div>
            <h2>我的帖子</h2>
            <p>最近发布和持续获得互动的内容</p>
          </div>
        </div>
        <div class="post-list">
          <PostCard
            v-for="post in recentPosts"
            :key="post.id"
            :post="post"
            :interaction="interactions[post.id]"
            @like="store.toggleLike"
            @favorite="store.toggleFavorite"
          />
        </div>
      </section>

      <section v-else-if="profileTab === '收藏'" class="panel-card panel-card--soft">
        <h2>我的收藏</h2>
        <p>你收藏的攻略、评测和创作会在这里持续沉淀。</p>
      </section>

      <section v-else class="panel-card panel-card--soft">
        <h2>互动记录</h2>
        <p>查看最近收到的点赞、评论与关注动态。</p>
      </section>
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="我的收藏" description="最近保存的高质量内容方向">
        <ul class="simple-list">
          <li>《星海远征》开荒路线合集</li>
          <li>战术回响赛季节奏复盘</li>
          <li>夜幕工坊营地设计灵感</li>
        </ul>
      </SidebarCard>

      <SidebarCard title="近期互动" description="你的社区活跃摘要">
        <div class="metric-list">
          <div>
            <strong>34</strong>
            <span>收到评论</span>
          </div>
          <div>
            <strong>126</strong>
            <span>新增点赞</span>
          </div>
          <div>
            <strong>8</strong>
            <span>新增收藏</span>
          </div>
        </div>
      </SidebarCard>
    </aside>
  </div>
</template>
