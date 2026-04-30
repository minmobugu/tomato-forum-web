<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import FilterChipGroup from '../../components/common/FilterChipGroup.vue'
import FeedTabs from '../../components/common/FeedTabs.vue'
import MetricList from '../../components/common/MetricList.vue'
import SectionHeader from '../../components/common/SectionHeader.vue'
import TagList from '../../components/common/TagList.vue'
import ChannelEntryCard from '../../components/home/ChannelEntryCard.vue'
import EventBanner from '../../components/home/EventBanner.vue'
import GameSpotlightCard from '../../components/home/GameSpotlightCard.vue'
import HeroFeatureCard from '../../components/home/HeroFeatureCard.vue'
import PostCard from '../../components/post/PostCard.vue'
import RankBoard from '../../components/home/RankBoard.vue'
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
          <FeedTabs v-model="activeFeed" />
        </SectionHeader>

        <FilterChipGroup :options="channelOptions" :model-value="activeChannel" @update:model-value="store.setActiveChannel" />

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
        <MetricList
          :items="[
            { label: '新增评论', value: '4.8k' },
            { label: '新帖子', value: '1.2k' },
            { label: '内容互动率', value: '87%' },
          ]"
        />
      </SidebarCard>

      <SidebarCard title="热门标签" description="看看大家正在讨论什么">
        <TagList :items="['版本前瞻', '联机开黑', '地图探索', '配装思路', '截图分享', '赛事复盘']" />
      </SidebarCard>
    </aside>
  </div>
</template>
