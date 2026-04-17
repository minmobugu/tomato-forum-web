<script setup lang="ts">
import type { TopbarMessage } from '../../types/community'

defineProps<{
  messages: TopbarMessage[]
}>()

const emit = defineEmits<{
  select: [messageId: number]
}>()

const iconMap: Record<TopbarMessage['type'], string> = {
  comment: '评',
  like: '赞',
  favorite: '藏',
  system: '新',
}
</script>

<template>
  <section class="topbar-panel topbar-message-panel panel-card panel-card--soft">
    <div class="topbar-panel__header">
      <div>
        <small>消息中心</small>
        <h3>最近的互动与提醒</h3>
      </div>
      <span class="topbar-panel__hint">点击后会标记已读</span>
    </div>

    <div v-if="messages.length" class="topbar-message-panel__list">
      <button
        v-for="message in messages"
        :key="message.id"
        class="topbar-message-panel__item"
        :class="{ 'topbar-message-panel__item--read': message.isRead }"
        type="button"
        @click="emit('select', message.id)"
      >
        <span class="topbar-message-panel__icon">{{ iconMap[message.type] }}</span>
        <div class="topbar-message-panel__copy">
          <div class="topbar-message-panel__title-row">
            <strong>{{ message.title }}</strong>
            <time>{{ message.publishTime }}</time>
          </div>
          <p>{{ message.content }}</p>
        </div>
      </button>
    </div>

    <div v-else class="topbar-panel__empty">
      <strong>暂时没有新消息</strong>
      <p>后续收到的评论、点赞和系统通知都会显示在这里。</p>
    </div>
  </section>
</template>
