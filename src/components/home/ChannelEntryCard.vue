<script setup lang="ts">
import type { FeedChannel } from '../../types/community'

defineProps<{
  channel: FeedChannel
  active?: boolean
}>()
</script>

<template>
  <button class="channel-entry" :class="{ 'channel-entry--active': active }" type="button">
    <span class="channel-entry__icon">{{ channel.icon }}</span>
    <div>
      <strong>{{ channel.name }}</strong>
      <p>{{ channel.description }}</p>
    </div>
  </button>
</template>
