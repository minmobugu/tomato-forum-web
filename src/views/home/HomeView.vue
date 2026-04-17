<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import ChannelEntryCard from '../../components/home/ChannelEntryCard.vue'
import EventBanner from '../../components/home/EventBanner.vue'
import FeedTabs from '../../components/home/FeedTabs.vue'
import GameSpotlightCard from '../../components/home/GameSpotlightCard.vue'
import HeroFeatureCard from '../../components/home/HeroFeatureCard.vue'
import PostCard from '../../components/home/PostCard.vue'
import RankBoard from '../../components/home/RankBoard.vue'
import SectionHeader from '../../components/home/SectionHeader.vue'
import { useCommunityStore } from '../../stores/community'

const route = useRoute()
const store = useCommunityStore()
const {
  activeChannel,
  activeFeed,
  communityEvents,
  feedChannels,
  featuredGames,
  heroFeature,
  interactions,
  rankGroups,
  visiblePosts,
} = storeToRefs(store)

const channelOptions = computed(() => ['全部', ...feedChannels.value.map((channel) => channel.name)])

function syncChannelFromRoute() {
  const routeChannel = typeof route.query.channel === 'string' ? route.query.channel : '全部'
  const available = new Set(channelOptions.value)
  store.setActiveChannel(available.has(routeChannel) ? routeChannel : '全部')
}

onMounted(async () => {
  await store.bootstrapHome()
  syncChannelFromRoute()
})

watch(() => route.query.channel, syncChannelFromRoute)
</script>

<template>
  <div class="page-grid home-page home-page--dense">
    <section class="content-stack">
      <section v-if="heroFeature" class="hero-showcase-grid">
        <HeroFeatureCard :feature="heroFeature" />

        <div class="hero-showcase-grid__side">
          <EventBanner v-for="event in communityEvents" :key="event.id" :event="event" />
        </div>
      </section>

      <section class="content-section">
        <SectionHeader title="快捷频道" subtitle="快速进入你最关心的社区内容类型" />
        <div class="channel-grid">
          <ChannelEntryCard
            v-for="channel in feedChannels"
            :key="channel.id"
            :channel="channel"
            :active="channel.name === activeChannel"
            @click="store.setActiveChannel(channel.name)"
          />
        </div>
      </section>

      <section class="content-section">
        <SectionHeader title="推荐游戏" subtitle="近期热度上升的社区焦点作品" />
        <div class="spotlight-grid">
          <GameSpotlightCard v-for="game in featuredGames" :key="game.id" :game="game" />
        </div>
      </section>

      <section class="content-section">
        <SectionHeader title="社区动态" subtitle="精选、热门与最新内容实时更新">
          <FeedTabs v-model="activeFeed" @update:model-value="store.setActiveFeed" />
        </SectionHeader>

        <div class="feed-filter-row">
          <button
            v-for="channel in channelOptions"
            :key="channel"
            class="filter-chip"
            :class="{ 'filter-chip--active': channel === activeChannel }"
            type="button"
            @click="store.setActiveChannel(channel)"
          >
            {{ channel }}
          </button>
        </div>

        <div class="post-list">
          <PostCard
            v-for="post in visiblePosts"
            :key="post.id"
            :post="post"
            :interaction="interactions[post.id]"
            @like="store.toggleLike"
            @favorite="store.toggleFavorite"
          />
        </div>
      </section>
    </section>

    <aside class="sidebar-stack">
      <RankBoard
        v-for="group in rankGroups"
        :key="group.id"
        :title="group.title"
        :items="group.items"
      />

      <SidebarCard title="今日数据" description="社区内容保持活跃增长">
        <div class="metric-list">
          <div>
            <strong>4.8k</strong>
            <span>新增评论</span>
          </div>
          <div>
            <strong>1.2k</strong>
            <span>新帖子</span>
          </div>
          <div>
            <strong>87%</strong>
            <span>内容互动率</span>
          </div>
        </div>
      </SidebarCard>

      <SidebarCard title="热门标签" description="看看大家正在讨论什么">
        <div class="tag-list">
          <span>版本前瞻</span>
          <span>联机开黑</span>
          <span>地图探索</span>
          <span>配装思路</span>
          <span>截图分享</span>
          <span>赛事复盘</span>
        </div>
      </SidebarCard>
    </aside>
  </div>
</template>
