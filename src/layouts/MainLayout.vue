<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import AuthModal from '../components/auth/AuthModal.vue'
import TopbarSearchPanel from '../components/layout/TopbarSearchPanel.vue'
import { useAuthStore } from '../stores/auth'
import { useCommunityStore } from '../stores/community'
import { useImStore } from '../stores/im'
import type { AuthMode } from '../types/auth'

const route = useRoute()
const router = useRouter()
const store = useCommunityStore()
const imStore = useImStore()
const authStore = useAuthStore()
const { feedChannels, featuredGames, posts, profile, unreadMessageCount } = storeToRefs(store)
const { totalUnreadCount: unreadChatCount } = storeToRefs(imStore)
const { authErrorMessage, authMode, currentUser, isAuthenticated, isAuthModalOpen, isSendingCode, isSubmitting } = storeToRefs(authStore)

const topbarRef = ref<HTMLElement | null>(null)
const topbarInnerRef = ref<HTMLElement | null>(null)
const searchTriggerRef = ref<HTMLElement | null>(null)
const searchPanelContentRef = ref<HTMLElement | null>(null)
const authPanelContentRef = ref<HTMLElement | null>(null)
const isScrolled = ref(false)
const activePanel = ref<'search' | null>(null)
const searchQuery = ref('')
const panelOffsetTop = ref(72)
const panelOffsetLeft = ref(16)
const panelWidth = ref(0)
const topbarHeight = ref(64)
const unifiedUnreadCount = computed(() => unreadMessageCount.value + unreadChatCount.value)

const pageTitle = computed(() => {
  if (route.name === 'games') return '探索热门游戏专区'
  if (route.name === 'messages') return ''
  if (route.name === 'publish') return ''
  if (route.name === 'profile') return '打造你的玩家名片'
  if (route.name === 'post-detail') return '沉浸式阅读社区好内容'
  return '发现好游戏，分享好内容'
})

const pageDescription = computed(() => {
  if (route.name === 'games') return '从社区热玩榜、分类标签和专题讨论里找到值得长期关注的作品。'
  if (route.name === 'messages') return ''
  if (route.name === 'publish') return ''
  if (route.name === 'profile') return '展示你的创作、收藏、勋章与常玩游戏，沉淀自己的社区身份。'
  if (route.name === 'post-detail') return '围绕每一篇攻略、评测和创作内容建立更完整的讨论氛围。'
  return '聚合版本攻略、赛事分析、截图创作与玩家讨论，把社区最有价值的内容放到你面前。'
})

const searchGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return [
      { title: '帖子', items: [] },
      { title: '游戏', items: [] },
      { title: '频道', items: [] },
      { title: '玩家', items: [] },
    ]
  }

  return [
    {
      title: '帖子',
      items: posts.value
        .filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.summary.toLowerCase().includes(query) ||
            post.game.toLowerCase().includes(query),
        )
        .slice(0, 3)
        .map((post) => ({
          id: `post:${post.id}`,
          label: post.title,
          meta: `${post.game} · ${post.publishTime}`,
          typeLabel: '帖子',
        })),
    },
    {
      title: '游戏',
      items: featuredGames.value
        .filter(
          (game) =>
            game.name.toLowerCase().includes(query) ||
            game.genre.toLowerCase().includes(query) ||
            game.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
        .slice(0, 3)
        .map((game) => ({
          id: `game:${game.genre}`,
          label: game.name,
          meta: `${game.genre} · ${game.followers} 关注`,
          typeLabel: '游戏',
        })),
    },
    {
      title: '频道',
      items: feedChannels.value
        .filter(
          (channel) =>
            channel.name.toLowerCase().includes(query) ||
            channel.description.toLowerCase().includes(query),
        )
        .slice(0, 3)
        .map((channel) => ({
          id: `channel:${channel.name}`,
          label: channel.name,
          meta: channel.description,
          typeLabel: '频道',
        })),
    },
    {
      title: '玩家',
      items:
        profile.value &&
        (profile.value.name.toLowerCase().includes(query) || profile.value.handle.toLowerCase().includes(query))
          ? [
              {
                id: 'profile:me',
                label: profile.value.name,
                meta: profile.value.handle,
                typeLabel: '玩家',
              },
            ]
          : [],
    },
  ]
})

const panelStyle = computed(() => ({
  top: `${panelOffsetTop.value}px`,
  left: `${panelOffsetLeft.value}px`,
  width: `${panelWidth.value}px`,
  maxWidth: `${panelWidth.value}px`,
}))

const backdropStyle = computed(() => ({
  top: `${topbarHeight.value}px`,
}))

function updateSearchLayerPosition() {
  const topbarElement = topbarRef.value
  const topbarInnerElement = topbarInnerRef.value
  if (!topbarElement || !topbarInnerElement) return

  const topbarRect = topbarElement.getBoundingClientRect()
  const topbarInnerRect = topbarInnerElement.getBoundingClientRect()

  topbarHeight.value = topbarRect.height
  panelOffsetTop.value = topbarRect.bottom + 8
  panelOffsetLeft.value = topbarInnerRect.left
  panelWidth.value = topbarInnerRect.width
}

function handleScroll() {
  isScrolled.value = window.scrollY > 16
}

function handleViewportChange() {
  handleScroll()

  if (activePanel.value === 'search') {
    updateSearchLayerPosition()
  }
}

function closePanel() {
  activePanel.value = null
}

function openAuthModal() {
  closePanel()
  authStore.openAuthModal()
}

async function openSearchPanel() {
  await store.loadTopbarData()
  activePanel.value = 'search'
  await nextTick()
  updateSearchLayerPosition()
}

async function toggleSearchPanel() {
  if (activePanel.value === 'search') {
    closePanel()
    return
  }

  await openSearchPanel()
}

async function openMessagesPage() {
  closePanel()
  await router.push({ name: 'messages' })
}

async function openPublishPage() {
  closePanel()
  await router.push({ name: 'publish' })
}

function isRouteActive(name: string) {
  return route.name === name
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (isAuthModalOpen.value) {
      authStore.closeAuthModal()
      return
    }

    closePanel()
  }
}

function handlePointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target) return

  if (isAuthModalOpen.value) {
    if (authPanelContentRef.value?.contains(target)) {
      return
    }

    authStore.closeAuthModal()
    return
  }

  if (activePanel.value !== 'search') return

  if (searchPanelContentRef.value?.contains(target) || searchTriggerRef.value?.contains(target)) {
    return
  }

  closePanel()
}

async function handleSearchSelect(resultId: string) {
  const [type, value] = resultId.split(':')

  closePanel()

  if (type === 'post') {
    await router.push(`/post/${value}`)
    return
  }

  if (type === 'game') {
    await router.push({ name: 'games', query: { genre: value } })
    return
  }

  if (type === 'channel') {
    await router.push({ name: 'home', query: { channel: value } })
    return
  }

  await router.push({ name: 'profile' })
}

function switchAuthMode(mode: AuthMode) {
  authStore.switchAuthMode(mode)
}

async function sendCode(phone: string) {
  try {
    await authStore.sendVerificationCode(phone)
  }
  catch {
    return
  }
}

async function submitCodeLogin(payload: { phone: string; code: string }) {
  try {
    await authStore.loginWithCode(payload)
    await authStore.resumeProtectedNavigation(router)
  }
  catch {
    return
  }
}

async function submitPasswordLogin(payload: { phone: string; password: string }) {
  try {
    await authStore.loginWithPassword(payload)
    await authStore.resumeProtectedNavigation(router)
  }
  catch {
    return
  }
}

watch(activePanel, async (value) => {
  if (value !== 'search') return

  await nextTick()
  updateSearchLayerPosition()
})

watch(
  () => route.fullPath,
  () => {
    closePanel()
  },
)

onMounted(() => {
  handleScroll()
  updateSearchLayerPosition()
  store.loadTopbarData()
  if (isAuthenticated.value) {
    imStore.bootstrapConversations().catch(() => {})
  }
  window.addEventListener('scroll', handleViewportChange, { passive: true })
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('pointerdown', handlePointerDown)
})

watch(isAuthenticated, (value) => {
  if (value) {
    imStore.bootstrapConversations().catch(() => {})
    return
  }

  imStore.resetState()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleViewportChange)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('pointerdown', handlePointerDown)
})
</script>

<template>
  <div class="app-shell">
    <header ref="topbarRef" class="topbar" :class="{ 'topbar--scrolled': isScrolled }">
      <div ref="topbarInnerRef" class="container topbar__inner">
        <RouterLink class="brand" to="/">
          <span class="brand__mark">小</span>
          <div>
            <strong>小番茄</strong>
            <span>游戏分享社区</span>
          </div>
        </RouterLink>

        <nav class="topbar__nav">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/games">游戏专区</RouterLink>
          <RouterLink to="/profile">个人中心</RouterLink>
        </nav>

        <div class="topbar__actions">
          <button
            ref="searchTriggerRef"
            class="search-pill topbar-trigger"
            :class="{ 'topbar-trigger--active': activePanel === 'search' }"
            type="button"
            @click="toggleSearchPanel"
          >
            <span>{{ searchQuery || '搜索游戏 / 攻略 / 玩家 / 话题' }}</span>
          </button>
          <button
            class="ghost-button topbar-trigger topbar-trigger--message"
            :class="{ 'topbar-trigger--active': isRouteActive('messages') }"
            type="button"
            @click="openMessagesPage"
          >
            消息
            <span v-if="unifiedUnreadCount" class="topbar-badge">{{ unifiedUnreadCount }}</span>
          </button>
          <button
            class="primary-button topbar-trigger"
            :class="{ 'topbar-trigger--active': isRouteActive('publish') }"
            type="button"
            @click="openPublishPage"
          >
            发布内容
          </button>
          <button v-if="!isAuthenticated" class="ghost-button topbar-trigger" type="button" @click="openAuthModal">
            登录 / 注册
          </button>
          <div v-else class="avatar-badge" :title="currentUser?.name">{{ currentUser?.name?.slice(0, 1) ?? 'T' }}</div>
        </div>
      </div>
    </header>

    <Teleport to="body">
      <div v-if="activePanel === 'search'" class="topbar-panel-layer topbar-panel-layer--search">
        <button class="topbar-panel-layer__backdrop" :style="backdropStyle" type="button" @click="closePanel"></button>
        <div ref="searchPanelContentRef" class="topbar-panel-layer__content" :style="panelStyle">
          <TopbarSearchPanel v-model:query="searchQuery" :groups="searchGroups" @select="handleSearchSelect" />
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="isAuthModalOpen" class="auth-modal-layer">
        <button class="auth-modal-layer__backdrop" type="button" @click="authStore.closeAuthModal()"></button>
        <div ref="authPanelContentRef" class="auth-modal-layer__content">
          <AuthModal
            :open="isAuthModalOpen"
            :mode="authMode"
            :is-sending-code="isSendingCode"
            :is-submitting="isSubmitting"
            :error-message="authErrorMessage"
            @close="authStore.closeAuthModal()"
            @switch-mode="switchAuthMode"
            @send-code="sendCode"
            @submit-code-login="submitCodeLogin"
            @submit-password-login="submitPasswordLogin"
          />
        </div>
      </div>
    </Teleport>

    <section class="hero-banner" :class="{ 'hero-banner--compact': route.name !== 'home' }">
      <div class="container hero-banner__inner" :class="{ 'hero-banner__inner--single': route.name !== 'home' }">
        <div class="hero-banner__copy">
          <p v-if="pageTitle" class="eyebrow">Tomato Game Hub</p>
          <h1 v-if="pageTitle">{{ pageTitle }}</h1>
          <p v-if="pageDescription" class="hero-copy">{{ pageDescription }}</p>
          <div v-if="pageTitle" class="hero-banner__chips">
            <span>高质量内容</span>
            <span>热游讨论</span>
            <span>创作者社区</span>
          </div>
        </div>
        <div v-if="route.name === 'home'" class="hero-highlight">
          <span>社区日活</span>
          <strong>126,000+</strong>
          <small>今日已更新 48 篇精选帖子</small>
        </div>
      </div>
    </section>

    <main class="main-area container">
      <RouterView />
    </main>

    <nav class="mobile-tabbar">
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/games">游戏</RouterLink>
      <RouterLink to="/profile">我的</RouterLink>
    </nav>
  </div>
</template>
