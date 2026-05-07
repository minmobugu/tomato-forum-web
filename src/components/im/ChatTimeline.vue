<script setup lang="ts">
import { computed } from 'vue'

import type { ConversationDetail, ImMessage } from '../../types/im'

const props = defineProps<{
  conversation: ConversationDetail
  messages: ImMessage[]
  currentUserId: number | null
}>()

const membersById = computed(() =>
  Object.fromEntries(props.conversation.members.map((member) => [member.userId, member])),
)

function formatMessageTime(value: string) {
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

function resolveSenderName(senderId: number) {
  return membersById.value[senderId]?.profile.displayName ?? `用户 ${senderId}`
}
</script>

<template>
  <section class="panel-card chat-timeline">
    <div class="chat-timeline__header">
      <div>
        <small>{{ conversation.conversationType === 'GROUP' ? '群聊' : '私聊' }}</small>
        <h3>{{ conversation.displayName }}</h3>
      </div>
      <span class="topbar-panel__hint">{{ conversation.members.length }} 人</span>
    </div>

    <div v-if="messages.length" class="chat-timeline__list">
      <article
        v-for="message in messages"
        :key="message.id"
        class="chat-bubble"
        :class="{
          'chat-bubble--self': currentUserId != null && message.senderId === currentUserId,
          'chat-bubble--system': message.messageType === 'SYSTEM',
        }"
      >
        <template v-if="message.messageType === 'SYSTEM'">
          <p>{{ message.content }}</p>
          <time>{{ formatMessageTime(message.createTime) }}</time>
        </template>
        <template v-else>
          <strong>{{ resolveSenderName(message.senderId) }}</strong>
          <p>{{ message.content }}</p>
          <time>{{ formatMessageTime(message.createTime) }}</time>
        </template>
      </article>
    </div>

    <div v-else class="topbar-panel__empty">
      <strong>还没有历史消息</strong>
      <p>发送第一条消息后，这个会话会开始沉淀聊天记录。</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chat-timeline {
  display: grid;
  gap: 18px;
}

.chat-timeline__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chat-timeline__list {
  display: grid;
  gap: 12px;
}

.chat-bubble {
  max-width: min(78%, 560px);
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 20px 20px 20px 8px;
  background: rgba(255, 255, 255, 0.05);
}

.chat-bubble--self {
  justify-self: end;
  border-radius: 20px 20px 8px 20px;
  background: rgba(255, 120, 82, 0.18);
}

.chat-bubble--system {
  justify-self: center;
  max-width: 100%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  text-align: center;
}

.chat-bubble p {
  margin: 0;
}

.chat-bubble time,
.chat-bubble strong {
  color: var(--muted);
  font-size: 12px;
}
</style>
