<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import ChatTimeline from '../../components/im/ChatTimeline.vue'
import { useAuthStore } from '../../stores/auth'
import { useImStore } from '../../stores/im'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const store = useImStore()
const { activeConversation, isMessagesLoading, isSendingMessage, messagesByConversation, socketError } = storeToRefs(store)

const messageDraft = ref('')
const memberIdsDraft = ref('')
const conversationId = computed(() => Number(route.params.id))
const currentMessages = computed(() => messagesByConversation.value[conversationId.value] ?? [])
const currentUserId = computed(() => authStore.currentUser?.id ?? null)
const removableMembers = computed(() =>
  activeConversation.value?.members.filter((member) => member.userId !== currentUserId.value) ?? [],
)

async function loadConversation() {
  await store.openConversation(conversationId.value)
}

async function handleSendMessage() {
  const content = messageDraft.value.trim()
  if (!content) {
    return
  }

  await store.sendMessage(conversationId.value, content)
  messageDraft.value = ''
}

async function handleAddMembers() {
  const userIds = memberIdsDraft.value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)

  if (!userIds.length) {
    return
  }

  await store.addGroupMembers(conversationId.value, userIds)
  memberIdsDraft.value = ''
}

async function handleRemoveMember(userId: number) {
  await store.removeGroupMember(conversationId.value, userId)
}

async function handleQuitGroup() {
  await store.quitGroup(conversationId.value)
  await router.push('/chats')
}

onMounted(loadConversation)
watch(conversationId, () => {
  void loadConversation()
})
</script>

<template>
  <div v-if="activeConversation" class="page-grid chat-detail-page">
    <section class="content-stack">
      <ChatTimeline
        :conversation="activeConversation"
        :messages="currentMessages"
        :current-user-id="currentUserId"
      />

      <section class="panel-card chat-detail-page__composer">
        <div class="chat-detail-page__composer-header">
          <div>
            <small>发送消息</small>
            <h3>{{ isMessagesLoading ? '正在加载消息…' : '继续对话' }}</h3>
          </div>
          <span class="topbar-panel__hint">
            {{ activeConversation.members.find((member) => member.userId === currentUserId)?.lastReadSequence ?? 0 }}
            已读序号
          </span>
        </div>
        <textarea
          v-model="messageDraft"
          class="chat-detail-page__textarea"
          rows="4"
          placeholder="输入文本消息"
        />
        <div class="chat-detail-page__composer-actions">
          <span v-if="socketError">{{ socketError }}</span>
          <button class="primary-button" type="button" :disabled="isSendingMessage || !messageDraft.trim()" @click="handleSendMessage">
            发送消息
          </button>
        </div>
      </section>
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="会话信息" description="当前会话基础资料">
        <SimpleList
          :items="[
            `会话类型：${activeConversation.conversationType === 'GROUP' ? '群聊' : '私聊'}`,
            `最新序号：${activeConversation.latestSequence}`,
            `未读数：${activeConversation.unreadCount}`,
          ]"
        />
      </SidebarCard>

      <SidebarCard
        v-if="activeConversation.conversationType === 'GROUP'"
        title="群成员管理"
        description="支持拉人、移除成员和主动退群"
      >
        <div class="chat-detail-page__members">
          <label class="topbar-field">
            <span>新增成员 ID</span>
            <input v-model="memberIdsDraft" type="text" placeholder="例如 21, 34" />
          </label>
          <button class="ghost-button" type="button" @click="handleAddMembers">添加成员</button>

          <div class="chat-detail-page__member-list">
            <article v-for="member in removableMembers" :key="member.userId" class="chat-detail-page__member-card">
              <div>
                <strong>{{ member.profile.displayName }}</strong>
                <p>{{ member.role }} · {{ member.status }}</p>
              </div>
              <button class="text-action" type="button" @click="handleRemoveMember(member.userId)">移除</button>
            </article>
          </div>

          <button class="ghost-button" type="button" @click="handleQuitGroup">退出群聊</button>
        </div>
      </SidebarCard>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.chat-detail-page__composer,
.chat-detail-page__members {
  display: grid;
  gap: 16px;
}

.chat-detail-page__composer-header,
.chat-detail-page__composer-actions,
.chat-detail-page__member-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chat-detail-page__textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  padding: 14px;
  resize: vertical;
}

.chat-detail-page__member-list {
  display: grid;
  gap: 10px;
}

.chat-detail-page__member-card {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
}

.chat-detail-page__member-card p,
.chat-detail-page__composer-actions span {
  margin: 0;
  color: var(--muted);
}
</style>
