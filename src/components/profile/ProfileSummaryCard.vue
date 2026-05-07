<script setup lang="ts">
import MetricList from '../common/MetricList.vue'
import TagList from '../common/TagList.vue'
import type { UserProfile } from '../../types/community'

defineProps<{
  profile: UserProfile
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
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
    <button v-if="actionLabel" class="primary-button" type="button" @click="emit('action')">{{ actionLabel }}</button>
    <MetricList class="profile-summary__stats" :items="profile.stats" />
    <div class="profile-summary__traits">
      <div>
        <small>常玩游戏</small>
        <TagList :items="profile.favoriteGames" />
      </div>
      <div>
        <small>玩家标签</small>
        <TagList :items="profile.traits" />
      </div>
    </div>
  </section>
</template>
