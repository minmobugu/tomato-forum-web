<script setup lang="ts">
import type { CommunityEvent } from '../../types/community'

defineProps<{
  event: CommunityEvent
}>()
</script>

<template>
  <article class="event-banner panel-card">
    <div>
      <span class="pill">{{ event.status }}</span>
      <h3>{{ event.title }}</h3>
      <p>{{ event.subtitle }}</p>
    </div>
    <button class="ghost-button" type="button">{{ event.cta }}</button>
  </article>
</template>
