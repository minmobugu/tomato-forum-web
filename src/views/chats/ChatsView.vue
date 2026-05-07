<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import ConversationListPanel from '../../components/im/ConversationListPanel.vue'
import { useImStore } from '../../stores/im'

const router = useRouter()
const store = useImStore()
const { conversations, isConversationsLoading, socketError, socketStatus } = storeToRefs(store)

const singleTargetUserId = ref('')
const groupName = ref('')
const groupAvatarUrl = ref('')
const groupMemberIds = ref('')

const canCreateSingle = computed(() => Number(singleTargetUserId.value) > 0)
const parsedGroupMemberIds = computed(() =>
  groupMemberIds.value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isInteger(value) && value > 0),
)

async function openConversation(conversationId: number) {
  await router.push(`/chats/${conversationId}`)
}

async function handleCreateSingleConversation() {
  const targetUserId = Number(singleTargetUserId.value)
  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return
  }

  const conversation = await store.createSingleConversation(targetUserId)
  singleTargetUserId.value = ''
  await router.push(`/chats/${conversation.id}`)
}

async function handleCreateGroupConversation() {
  const name = groupName.value.trim()
  if (!name) {
    return
  }

  const conversation = await store.createGroupConversation({
    name,
    avatarUrl: groupAvatarUrl.value.trim(),
    memberUserIds: parsedGroupMemberIds.value,
  })

  groupName.value = ''
  groupAvatarUrl.value = ''
  groupMemberIds.value = ''
  await router.push(`/chats/${conversation.id}`)
}

onMounted(async () => {
  await store.bootstrapConversations()
})
</script>

<template>
  <div class="page-grid chats-page">
    <section class="content-stack">
      <ConversationListPanel :conversations="conversations" @select="openConversation" />

      <section class="panel-card chats-page__composer">
        <div class="chats-page__composer-header">
          <div>
            <small>新建会话</small>
            <h3>发起私聊或创建群聊</h3>
          </div>
          <span class="topbar-panel__hint">{{ isConversationsLoading ? '正在同步会话…' : `实时状态：${socketStatus}` }}</span>
        </div>

        <div class="chats-page__composer-grid">
          <article class="panel-card panel-card--soft chats-page__form-card">
            <strong>发起私聊</strong>
            <p>输入目标用户 ID，服务端会返回已有会话或自动创建新会话。</p>
            <label class="topbar-field">
              <span>目标用户 ID</span>
              <input v-model="singleTargetUserId" type="number" min="1" placeholder="例如 11" />
            </label>
            <button class="primary-button" type="button" :disabled="!canCreateSingle" @click="handleCreateSingleConversation">
              开始私聊
            </button>
          </article>

          <article class="panel-card panel-card--soft chats-page__form-card">
            <strong>创建群聊</strong>
            <p>群成员以英文逗号分隔输入，建群后可以继续在详情页拉人或移除成员。</p>
            <label class="topbar-field">
              <span>群名称</span>
              <input v-model="groupName" type="text" maxlength="50" placeholder="例如 夜幕工坊据点群" />
            </label>
            <label class="topbar-field">
              <span>群头像 URL</span>
              <input v-model="groupAvatarUrl" type="url" placeholder="可选" />
            </label>
            <label class="topbar-field">
              <span>初始成员 ID</span>
              <input v-model="groupMemberIds" type="text" placeholder="例如 3, 12, 21" />
            </label>
            <button class="primary-button" type="button" :disabled="!groupName.trim()" @click="handleCreateGroupConversation">
              创建群聊
            </button>
          </article>
        </div>

        <p v-if="socketError" class="chats-page__socket-hint">{{ socketError }}</p>
      </section>
    </section>

    <aside class="sidebar-stack">
      <SidebarCard title="使用说明" description="当前 IM 能力与契约保持一致">
        <SimpleList
          :items="[
            '会话列表、会话详情、历史消息、发消息、已读同步都走 tomato-im HTTP 接口。',
            '群成员管理支持拉人、移除成员和主动退群，入口都在聊天详情页。',
            '实时连接会优先尝试 /ws/im；如果后端还没开 WebSocket，不影响基础聊天流程。',
          ]"
        />
      </SidebarCard>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.chats-page__composer,
.chats-page__composer-grid,
.chats-page__form-card {
  display: grid;
  gap: 16px;
}

.chats-page__composer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chats-page__composer-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chats-page__socket-hint {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 900px) {
  .chats-page__composer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
