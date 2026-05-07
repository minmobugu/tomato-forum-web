<script setup lang="ts">
import { computed } from 'vue'

import type { ConversationSummary } from '../../types/im'

const props = defineProps<{
  conversations: ConversationSummary[]
  activeConversationId?: number | null
}>()

const emit = defineEmits<{
  select: [conversationId: number]
}>()

const hasConversations = computed(() => props.conversations.length > 0)

function formatTime(value: string | null) {
  if (!value) {
    return '暂无消息'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <section class="panel-card conversation-panel">
    <div class="conversation-panel__header">
      <div>
        <small>IM 会话</small>
        <h3>最近联系人与群聊</h3>
      </div>
      <span class="topbar-panel__hint">{{ conversations.length }} 个会话</span>
    </div>

    <div v-if="hasConversations" class="conversation-panel__list">
      <button
        v-for="conversation in conversations"
        :key="conversation.id"
        class="conversation-panel__item"
        :class="{ 'conversation-panel__item--active': conversation.id === activeConversationId }"
        type="button"
        @click="emit('select', conversation.id)"
      >
        <img
          v-if="conversation.avatarUrl"
          :src="conversation.avatarUrl"
          :alt="conversation.displayName"
          class="conversation-panel__avatar"
        />
        <div v-else class="conversation-panel__avatar conversation-panel__avatar--fallback">
          {{ conversation.displayName.slice(0, 1) }}
        </div>
        <div class="conversation-panel__copy">
          <div class="conversation-panel__title-row">
            <strong>{{ conversation.displayName }}</strong>
            <time>{{ formatTime(conversation.latestMessageTime) }}</time>
          </div>
          <p>{{ conversation.latestMessagePreview || '还没有消息，开始聊点什么吧。' }}</p>
          <div class="conversation-panel__meta">
            <span>{{ conversation.conversationType === 'GROUP' ? '群聊' : '私聊' }}</span>
            <span v-if="conversation.unreadCount" class="topbar-badge">{{ conversation.unreadCount }}</span>
          </div>
        </div>
      </button>
    </div>

    <div v-else class="topbar-panel__empty">
      <strong>还没有会话</strong>
      <p>你创建的私聊和群聊会集中展示在这里。</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.conversation-panel {
  display: grid;
  gap: 16px;
}

.conversation-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.conversation-panel__list {
  display: grid;
  gap: 10px;
}

.conversation-panel__item {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 14px;
  width: 100%;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.02);
  color: inherit;
  text-align: left;
}

.conversation-panel__item--active {
  border-color: var(--brand);
  background: rgba(255, 120, 82, 0.12);
}

.conversation-panel__avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  object-fit: cover;
}

.conversation-panel__avatar--fallback {
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
}

.conversation-panel__copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.conversation-panel__title-row,
.conversation-panel__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.conversation-panel__copy p {
  margin: 0;
  color: var(--muted);
}
</style>
