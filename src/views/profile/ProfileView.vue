<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import MetricList from '../../components/common/MetricList.vue'
import FeedTabs from '../../components/common/FeedTabs.vue'
import InfoPanel from '../../components/common/InfoPanel.vue'
import SectionHeader from '../../components/common/SectionHeader.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import SidebarCard from '../../components/common/SidebarCard.vue'
import PostCard from '../../components/post/PostCard.vue'
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
        <FeedTabs v-model="profileTab" :tabs="tabOptions" />
      </section>

      <section v-if="profileTab === '帖子'" class="content-section">
        <SectionHeader title="我的帖子" subtitle="最近发布和持续获得互动的内容" />
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

      <InfoPanel
        v-else-if="profileTab === '收藏'"
        title="我的收藏"
        description="你收藏的攻略、评测和创作会在这里持续沉淀。"
      />

      <InfoPanel v-else title="互动记录" description="查看最近收到的点赞、评论与关注动态。" />
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="我的收藏" description="最近保存的高质量内容方向">
        <SimpleList :items="['《星海远征》开荒路线合集', '战术回响赛季节奏复盘', '夜幕工坊营地设计灵感']" />
      </SidebarCard>

      <SidebarCard title="近期互动" description="你的社区活跃摘要">
        <MetricList
          :items="[
            { label: '收到评论', value: '34' },
            { label: '新增点赞', value: '126' },
            { label: '新增收藏', value: '8' },
          ]"
        />
      </SidebarCard>
    </aside>
  </div>
</template>
