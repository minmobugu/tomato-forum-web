<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import SimpleList from '../../components/common/SimpleList.vue'
import TopbarMessagePanel from '../../components/layout/TopbarMessagePanel.vue'
import { useCommunityStore } from '../../stores/community'

const router = useRouter()
const store = useCommunityStore()
const { topbarMessages } = storeToRefs(store)

async function handleSelect(messageId: number) {
  const message = topbarMessages.value.find((item) => item.id === messageId)
  if (!message) return

  store.markMessageRead(messageId)

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

onMounted(async () => {
  await store.loadTopbarData()
})
</script>

<template>
  <div class="page-grid page-grid--compact messages-page">
    <section class="content-stack content-stack--compact">
      <TopbarMessagePanel :messages="topbarMessages" @select="handleSelect" />
    </section>

    <aside class="sidebar-stack sidebar-stack--compact">
      <SidebarCard title="消息使用建议" description="优先处理最重要的提醒">
        <SimpleList
          :items="[
            '优先查看带帖子落点的评论和互动提醒，最容易形成持续讨论。',
            '系统通知适合快速了解活动与频道变化，再决定是否深入浏览。',
            '清掉未读后，顶部徽标会同步下降，回到首页也能保持一致。',
          ]"
        />
      </SidebarCard>
    </aside>
  </div>
</template>
