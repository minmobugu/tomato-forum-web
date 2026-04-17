<script setup lang="ts">
import type { UserProfile } from '../../types/community'

defineProps<{
  profile: UserProfile
}>()
</script>

<template>
  <section class="profile-summary panel-card">
    <div class="profile-summary__hero">
      <img :src="profile.avatar" :alt="profile.name" class="profile-summary__avatar" />
      <div>
        <h2>{{ profile.name }}</h2>
        <p>{{ profile.handle }}</p>
      </div>
    </div>
    <p class="profile-summary__bio">{{ profile.bio }}</p>
    <div class="profile-summary__badges">
      <span v-for="badge in profile.badges" :key="badge" class="profile-badge">{{ badge }}</span>
    </div>
    <div class="profile-summary__stats">
      <div v-for="stat in profile.stats" :key="stat.label">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </div>
    <div class="profile-summary__traits">
      <div>
        <small>常玩游戏</small>
        <div class="tag-list">
          <span v-for="game in profile.favoriteGames" :key="game">{{ game }}</span>
        </div>
      </div>
      <div>
        <small>玩家标签</small>
        <div class="tag-list">
          <span v-for="trait in profile.traits" :key="trait">{{ trait }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
