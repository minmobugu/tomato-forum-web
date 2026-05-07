<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import MetricList from '../../components/common/MetricList.vue'
import FeedTabs from '../../components/common/FeedTabs.vue'
import InfoPanel from '../../components/common/InfoPanel.vue'
import SectionHeader from '../../components/common/SectionHeader.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import SidebarCard from '../../components/common/SidebarCard.vue'
import PostCard from '../../components/post/PostCard.vue'
import ProfileSummaryCard from '../../components/profile/ProfileSummaryCard.vue'
import { useCommunityStore } from '../../stores/community'
import type { UserProfile } from '../../types/community'

const route = useRoute()
const router = useRouter()
const store = useCommunityStore()
const { interactions, posts, profile } = storeToRefs(store)
const profileTab = ref<'帖子' | '收藏' | '互动'>('帖子')

const viewedUserId = computed(() => Number(route.query.userId))
const isViewingOtherUser = computed(() => Number.isInteger(viewedUserId.value) && viewedUserId.value > 0 && viewedUserId.value !== profile.value?.id)

const viewedProfile = computed<UserProfile | null>(() => {
  if (!isViewingOtherUser.value) {
    return profile.value
  }

  const relatedPosts = posts.value.filter((post) => post.author.id === viewedUserId.value)
  const author = relatedPosts[0]?.author
  if (!author) {
    return null
  }

  return {
    id: author.id,
    name: author.name,
    handle: `@user_${author.id}`,
    bio: `${author.name} 的社区主页，整理了近期发过的帖子和常见讨论方向。`,
    avatar: author.avatar,
    stats: [
      { label: '帖子', value: String(relatedPosts.length) },
      { label: '获赞', value: String(relatedPosts.reduce((total, post) => total + post.likes, 0)) },
      { label: '收藏', value: String(relatedPosts.reduce((total, post) => total + post.favorites, 0)) },
    ],
    badges: ['社区作者', author.level],
    favoriteGames: Array.from(new Set(relatedPosts.map((post) => post.game))).slice(0, 3),
    traits: Array.from(new Set(relatedPosts.flatMap((post) => [post.channel, post.topic]))).slice(0, 4),
  }
})

const recentPosts = computed(() => {
  if (isViewingOtherUser.value) {
    return posts.value.filter((post) => post.author.id === viewedUserId.value).slice(0, 3)
  }

  return posts.value.slice(0, 2)
})

const tabOptions: Array<'帖子' | '收藏' | '互动'> = ['帖子', '收藏', '互动']

async function handlePrivateChat() {
  if (!viewedProfile.value?.id) {
    return
  }

  await router.push({
    name: 'messages',
    query: {
      tab: 'chat',
      targetUserId: String(viewedProfile.value.id),
    },
  })
}

onMounted(async () => {
  await Promise.all([store.loadProfile(), store.bootstrapHome()])
})
</script>

<template>
  <div v-if="viewedProfile" class="page-grid profile-page">
    <section class="content-stack">
      <ProfileSummaryCard
        :profile="viewedProfile"
        :action-label="isViewingOtherUser ? '私聊' : undefined"
        @action="handlePrivateChat"
      />

      <section class="panel-card profile-tabs-panel">
        <FeedTabs v-model="profileTab" :tabs="tabOptions" />
      </section>

      <section v-if="profileTab === '帖子'" class="content-section">
        <SectionHeader
          :title="isViewingOtherUser ? 'TA 的帖子' : '我的帖子'"
          :subtitle="isViewingOtherUser ? '进入主页后可直接发起私聊并继续围绕内容交流' : '最近发布和持续获得互动的内容'"
        />
        <div class="post-list">
          <PostCard
            v-for="post in recentPosts"
            :key="post.id"
            :post="post"
            :interaction="interactions[post.id]"
            @like="store.toggleLike"
            @dislike="store.toggleDislike"
            @favorite="store.toggleFavorite"
          />
        </div>
      </section>

      <InfoPanel
        v-else-if="profileTab === '收藏'"
        :title="isViewingOtherUser ? 'TA 的收藏偏好' : '我的收藏'"
        description="你收藏的攻略、评测和创作会在这里持续沉淀。"
      />

      <InfoPanel v-else :title="isViewingOtherUser ? 'TA 的互动记录' : '互动记录'" description="查看最近收到的点赞、评论与关注动态。" />
    </section>

    <aside class="sidebar-stack">
      <SidebarCard :title="isViewingOtherUser ? '对话建议' : '我的收藏'" :description="isViewingOtherUser ? '进入主页后的私聊入口会直接带你进入消息中心聊天页。' : '最近保存的高质量内容方向'">
        <SimpleList
          :items="isViewingOtherUser
            ? ['先围绕对方最近的帖子发起话题，更容易进入有效对话。', '如果已经有历史私聊，会直接复用原会话，不会重复创建。', '聊天消息会同步出现在消息中心通知流里，方便统一回看。']
            : ['《星海远征》开荒路线合集', '战术回响赛季节奏复盘', '夜幕工坊营地设计灵感']"
        />
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
