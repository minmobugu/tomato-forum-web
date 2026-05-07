<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import FeedTabs from '../../components/common/FeedTabs.vue'
import InfoPanel from '../../components/common/InfoPanel.vue'
import SidebarCard from '../../components/common/SidebarCard.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import ChatTimeline from '../../components/im/ChatTimeline.vue'
import ConversationListPanel from '../../components/im/ConversationListPanel.vue'
import TopbarMessagePanel from '../../components/layout/TopbarMessagePanel.vue'
import { useAuthStore } from '../../stores/auth'
import { useCommunityStore } from '../../stores/community'
import { useImStore } from '../../stores/im'
import type { TopbarMessage } from '../../types/community'

const route = useRoute()
const router = useRouter()
const communityStore = useCommunityStore()
const imStore = useImStore()
const authStore = useAuthStore()

const { topbarMessages } = storeToRefs(communityStore)
const { activeConversation, conversations, isMessagesLoading, isSendingMessage, messagesByConversation, socketError } = storeToRefs(imStore)

const activeTab = ref<'通知' | '聊天'>('通知')
const messageDraft = ref('')
const memberIdsDraft = ref('')

const currentUserId = computed(() => authStore.currentUser?.id ?? null)
const currentConversationId = computed(() => Number(route.query.conversationId))
const currentMessages = computed(() =>
  activeConversation.value ? (messagesByConversation.value[activeConversation.value.id] ?? []) : [],
)
const removableMembers = computed(() =>
  activeConversation.value?.members.filter((member) => member.userId !== currentUserId.value) ?? [],
)
const chatNotifications = computed<TopbarMessage[]>(() =>
  conversations.value.map((conversation) => ({
    id: Number(`9${conversation.id}`),
    title: conversation.displayName,
    content: conversation.latestMessagePreview || '会话已创建，开始聊点什么吧。',
    publishTime: formatConversationTime(conversation.latestMessageTime),
    type: 'chat',
    isRead: conversation.unreadCount === 0,
    conversationId: conversation.id,
    badgeText: conversation.unreadCount ? `${conversation.unreadCount} 条` : undefined,
  })),
)
const mergedMessages = computed(() => [...chatNotifications.value, ...topbarMessages.value])

function formatConversationTime(value: string | null) {
  if (!value) {
    return '刚刚'
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

async function syncRouteState() {
  const routeTab = route.query.tab === 'chat' ? '聊天' : '通知'
  activeTab.value = routeTab

  if (routeTab !== '聊天') {
    return
  }

  const targetUserId = Number(route.query.targetUserId)
  if (Number.isInteger(targetUserId) && targetUserId > 0) {
    const conversation = await imStore.createSingleConversation(targetUserId)
    await router.replace({
      name: 'messages',
      query: {
        tab: 'chat',
        conversationId: String(conversation.id),
      },
    })
    return
  }

  if (Number.isInteger(currentConversationId.value) && currentConversationId.value > 0) {
    await imStore.openConversation(currentConversationId.value)
  }
}

async function handleSelect(messageId: number) {
  const message = mergedMessages.value.find((item) => item.id === messageId)
  if (!message) return

  if (message.conversationId) {
    await router.push({
      name: 'messages',
      query: {
        tab: 'chat',
        conversationId: String(message.conversationId),
      },
    })
    return
  }

  const sourceMessage = topbarMessages.value.find((item) => item.id === messageId)
  if (sourceMessage) {
    communityStore.markMessageRead(messageId)
  }

  if (message.postId) {
    await router.push(`/post/${message.postId}`)
    return
  }

  if (message.route) {
    await router.push({ name: message.route.name, query: message.route.query })
    return
  }

  await router.push({ name: 'home' })
}

async function handleConversationSelect(conversationId: number) {
  await router.push({
    name: 'messages',
    query: {
      tab: 'chat',
      conversationId: String(conversationId),
    },
  })
}

async function handleSendMessage() {
  const content = messageDraft.value.trim()
  if (!content || !activeConversation.value) {
    return
  }

  await imStore.sendMessage(activeConversation.value.id, content)
  messageDraft.value = ''
}

async function handleAddMembers() {
  if (!activeConversation.value) {
    return
  }

  const userIds = memberIdsDraft.value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)

  if (!userIds.length) {
    return
  }

  await imStore.addGroupMembers(activeConversation.value.id, userIds)
  memberIdsDraft.value = ''
}

async function handleRemoveMember(userId: number) {
  if (!activeConversation.value) {
    return
  }

  await imStore.removeGroupMember(activeConversation.value.id, userId)
}

async function handleQuitGroup() {
  if (!activeConversation.value) {
    return
  }

  await imStore.quitGroup(activeConversation.value.id)
  await router.replace({ name: 'messages', query: { tab: 'chat' } })
}

watch(activeTab, async (value) => {
  await router.replace({
    name: 'messages',
    query: value === '聊天'
      ? {
          tab: 'chat',
          conversationId: activeConversation.value ? String(activeConversation.value.id) : undefined,
        }
      : {},
  })
})

watch(
  () => route.fullPath,
  () => {
    void syncRouteState()
  },
)

onMounted(async () => {
  await Promise.all([communityStore.loadTopbarData(), imStore.bootstrapConversations()])
  await syncRouteState()
})
</script>

<template>
  <div class="page-grid messages-page">
    <section class="content-stack">
      <section class="panel-card">
        <div class="messages-page__tabs">
          <div>
            <small>消息中心</small>
            <h3>通知与聊天统一收口</h3>
          </div>
          <FeedTabs v-model="activeTab" :tabs="['通知', '聊天']" />
        </div>
      </section>

      <template v-if="activeTab === '通知'">
        <TopbarMessagePanel :messages="mergedMessages" @select="handleSelect" />
      </template>

      <template v-else>
        <section class="messages-page__chat-grid">
          <ConversationListPanel
            :conversations="conversations"
            :active-conversation-id="activeConversation?.id"
            @select="handleConversationSelect"
          />

          <div class="messages-page__chat-stack">
            <ChatTimeline
              v-if="activeConversation"
              :conversation="activeConversation"
              :messages="currentMessages"
              :current-user-id="currentUserId"
            />

            <InfoPanel
              v-else
              title="选择一个会话"
              description="从左侧进入私聊或群聊，也可以先去用户主页点击私聊。"
            />

            <section v-if="activeConversation" class="panel-card messages-page__composer">
              <div class="messages-page__composer-header">
                <div>
                  <small>发送消息</small>
                  <h3>{{ isMessagesLoading ? '正在加载消息…' : '继续对话' }}</h3>
                </div>
                <span class="topbar-panel__hint">已读到 {{ activeConversation.latestSequence }}</span>
              </div>
              <textarea
                v-model="messageDraft"
                class="messages-page__textarea"
                rows="4"
                placeholder="输入文本消息"
              />
              <div class="messages-page__composer-actions">
                <span v-if="socketError">{{ socketError }}</span>
                <button class="primary-button" type="button" :disabled="isSendingMessage || !messageDraft.trim()" @click="handleSendMessage">
                  发送消息
                </button>
              </div>
            </section>
          </div>
        </section>
      </template>
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="消息使用建议" description="通知与聊天都在这里处理">
        <SimpleList
          :items="[
            '聊天会以通知类型出现在通知流里，点进去会直接切到聊天面板。',
            '用户主页和作者入口都可以发起私聊，会复用已有会话，不重复创建。',
            '群成员管理仍然在聊天面板里完成，后端 WebSocket 未就绪时会自动回退 HTTP。',
          ]"
        />
      </SidebarCard>

      <SidebarCard
        v-if="activeTab === '聊天' && activeConversation?.conversationType === 'GROUP'"
        title="群成员管理"
        description="支持拉人、移除成员和主动退群"
      >
        <div class="messages-page__members">
          <label class="topbar-field">
            <span>新增成员 ID</span>
            <input v-model="memberIdsDraft" type="text" placeholder="例如 21, 34" />
          </label>
          <button class="ghost-button" type="button" @click="handleAddMembers">添加成员</button>

          <div class="messages-page__member-list">
            <article v-for="member in removableMembers" :key="member.userId" class="messages-page__member-card">
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
.messages-page__tabs,
.messages-page__chat-stack,
.messages-page__composer,
.messages-page__members {
  display: grid;
  gap: 16px;
}

.messages-page__chat-grid {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 18px;
}

.messages-page__composer-header,
.messages-page__composer-actions,
.messages-page__member-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.messages-page__textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  padding: 14px;
  resize: vertical;
}

.messages-page__member-list {
  display: grid;
  gap: 10px;
}

.messages-page__member-card {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
}

.messages-page__member-card p,
.messages-page__composer-actions span {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 1024px) {
  .messages-page__chat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
