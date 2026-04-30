<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import FilterChipGroup from '../../components/common/FilterChipGroup.vue'
import SectionHeader from '../../components/common/SectionHeader.vue'
import MetricList from '../../components/common/MetricList.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import TagList from '../../components/common/TagList.vue'
import GameGridCard from '../../components/game/GameGridCard.vue'
import EventBanner from '../../components/home/EventBanner.vue'
import PostCard from '../../components/post/PostCard.vue'
import RankBoard from '../../components/home/RankBoard.vue'
import { useCommunityStore } from '../../stores/community'

const route = useRoute()
const store = useCommunityStore()
const { communityEvents, featuredGames, interactions, posts, rankGroups } = storeToRefs(store)
const activeGenre = ref('全部')

const genreOptions = computed(() => ['全部', ...new Set(featuredGames.value.map((game) => game.genre))])
const filteredGames = computed(() => {
  if (activeGenre.value === '全部') {
    return featuredGames.value
  }

  return featuredGames.value.filter((game) => game.genre === activeGenre.value)
})
const spotlightGame = computed(() => filteredGames.value[0] ?? featuredGames.value[0] ?? null)
const secondaryGames = computed(() => filteredGames.value.slice(1, 3))
const overviewMetrics = computed(() => {
  const hottestHeat = featuredGames.value.reduce((max, game) => Math.max(max, Number(game.heat)), 0)

  return [
    { label: '活跃专区', value: String(featuredGames.value.length) },
    { label: '热度峰值', value: String(hottestHeat) },
    { label: '讨论帖子', value: String(posts.value.length) },
  ]
})
const relatedPosts = computed(() => {
  const availableGames = new Set(filteredGames.value.map((game) => game.name))
  const source =
    activeGenre.value === '全部'
      ? posts.value
      : posts.value.filter((post) => availableGames.has(post.game))

  return source.slice(0, 2)
})

function syncGenreFromRoute() {
  const routeGenre = typeof route.query.genre === 'string' ? route.query.genre : '全部'
  const available = new Set(genreOptions.value)
  activeGenre.value = available.has(routeGenre) ? routeGenre : '全部'
}

onMounted(async () => {
  if (!featuredGames.value.length || !communityEvents.value.length || !posts.value.length) {
    await store.bootstrapHome()
  }

  syncGenreFromRoute()
})

watch(() => route.query.genre, syncGenreFromRoute)
</script>

<template>
  <div class="page-grid games-page">
    <section class="content-stack">
      <section class="hero-showcase-grid">
        <article v-if="spotlightGame" class="panel-card games-page__spotlight">
          <img :src="spotlightGame.cover" :alt="spotlightGame.name" class="games-page__spotlight-cover" />
          <div class="games-page__spotlight-overlay"></div>
          <div class="games-page__spotlight-content">
            <span class="pill">{{ spotlightGame.status }}</span>
            <h2>{{ spotlightGame.name }}</h2>
            <p>{{ spotlightGame.summary }}</p>
            <div class="games-page__spotlight-meta">
              <span>{{ spotlightGame.genre }}</span>
              <span>{{ spotlightGame.followers }} 关注</span>
              <span>热度 {{ spotlightGame.heat }}</span>
            </div>
            <TagList :items="spotlightGame.tags" />
          </div>
        </article>

        <div class="hero-showcase-grid__side">
          <SidebarCard title="本周关注方向" description="优先逛这几个热度上升中的游戏圈子">
            <div class="games-page__mini-list">
              <article v-for="game in secondaryGames" :key="game.id" class="games-page__mini-card">
                <img :src="game.cover" :alt="game.name" class="games-page__mini-cover" />
                <div class="games-page__mini-copy">
                  <strong>{{ game.name }}</strong>
                  <span>{{ game.genre }} · 热度 {{ game.heat }}</span>
                </div>
              </article>
            </div>
          </SidebarCard>

          <EventBanner v-for="event in communityEvents" :key="event.id" :event="event" />
        </div>
      </section>

      <section class="panel-card filter-panel games-page__filter-panel">
        <div class="games-page__filter-header">
          <div>
            <p class="eyebrow">精选专区</p>
            <h2>按类型发现值得长期关注的游戏社区</h2>
            <p class="hero-copy">从热游讨论、赛事内容到创作晒图，把不同风格的游戏圈子整理成清晰入口。</p>
          </div>
          <MetricList class="games-page__metrics" :items="overviewMetrics" single-column />
        </div>

        <FilterChipGroup v-model="activeGenre" :options="genreOptions" />
      </section>

      <section class="content-section">
        <SectionHeader title="热门游戏专区" subtitle="基于讨论热度和关注趋势推荐" />
        <div class="game-grid">
          <GameGridCard v-for="game in filteredGames" :key="game.id" :game="game" />
        </div>
      </section>

      <section class="content-section">
        <SectionHeader title="圈子热帖" subtitle="快速跟进当前游戏社区里最值得看的内容" />
        <div class="post-list">
          <PostCard
            v-for="post in relatedPosts"
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
      <RankBoard v-for="group in rankGroups.slice(0, 2)" :key="group.id" :title="group.title" :items="group.items" />

      <SidebarCard title="社区观察" description="适合继续深挖的内容方向">
        <SimpleList
          :items="[
            '关注热度高但讨论增速快的新专区，容易提前发现潜力社区。',
            '赛事型游戏优先看复盘贴和阵容拆解，信息密度更高。',
            '创作型游戏多看截图、营地和搭建类帖子，更容易找到圈子氛围。',
          ]"
        />
      </SidebarCard>
    </aside>
  </div>
</template>
