import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { imService } from '../services/im'
import { useAuthStore } from './auth'
import { pinia } from './pinia'
import type {
  ConversationDetail,
  ConversationMember,
  ConversationSummary,
  CreateGroupConversationDraft,
  ImMessage,
  ImSocketEnvelope,
  ImSocketStatus,
} from '../types/im'

function deriveWsUrl() {
  const explicitUrl = import.meta.env.VITE_IM_WS_URL
  if (explicitUrl) {
    return explicitUrl
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (!apiBaseUrl || apiBaseUrl.startsWith('/')) {
    if (typeof window === 'undefined') {
      return ''
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws/im`
  }

  try {
    const url = new URL(apiBaseUrl)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = '/ws/im'
    url.search = ''
    url.hash = ''
    return url.toString()
  }
  catch {
    return ''
  }
}

function upsertConversation(
  conversations: ConversationSummary[],
  nextConversation: ConversationSummary | ConversationDetail,
) {
  const currentIndex = conversations.findIndex((conversation) => conversation.id === nextConversation.id)
  if (currentIndex === -1) {
    return [nextConversation, ...conversations].sort(sortConversations)
  }

  const nextConversations = conversations.slice()
  nextConversations[currentIndex] = {
    id: nextConversation.id,
    conversationType: nextConversation.conversationType,
    displayName: nextConversation.displayName,
    avatarUrl: nextConversation.avatarUrl,
    latestMessagePreview: nextConversation.latestMessagePreview,
    latestMessageTime: nextConversation.latestMessageTime,
    latestSequence: nextConversation.latestSequence,
    unreadCount: nextConversation.unreadCount,
  }

  return nextConversations.sort(sortConversations)
}

function sortConversations(a: ConversationSummary, b: ConversationSummary) {
  const left = a.latestMessageTime ? new Date(a.latestMessageTime).getTime() : 0
  const right = b.latestMessageTime ? new Date(b.latestMessageTime).getTime() : 0
  return right - left
}

export const useImStore = defineStore('im', () => {
  const conversations = ref<ConversationSummary[]>([])
  const activeConversation = ref<ConversationDetail | null>(null)
  const messagesByConversation = ref<Record<number, ImMessage[]>>({})
  const isConversationsLoading = ref(false)
  const isMessagesLoading = ref(false)
  const isSendingMessage = ref(false)
  const socketStatus = ref<ImSocketStatus>('disconnected')
  const socket = ref<WebSocket | null>(null)
  const socketError = ref('')

  const totalUnreadCount = computed(() =>
    conversations.value.reduce((total, conversation) => total + conversation.unreadCount, 0),
  )

  function currentUserId() {
    return useAuthStore(pinia).currentUser?.id ?? null
  }

  function setConversationDetail(conversation: ConversationDetail) {
    activeConversation.value = conversation
    conversations.value = upsertConversation(conversations.value, conversation)
  }

  function setMessages(conversationId: number, messages: ImMessage[]) {
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [conversationId]: messages.slice().sort((left, right) => left.sequence - right.sequence),
    }
  }

  function appendMessage(message: ImMessage) {
    const currentMessages = messagesByConversation.value[message.conversationId] ?? []
    if (currentMessages.some((item) => item.id === message.id)) {
      return
    }

    setMessages(message.conversationId, [...currentMessages, message])

    const targetConversation = conversations.value.find((conversation) => conversation.id === message.conversationId)
    const isSelf = message.senderId === currentUserId()
    if (targetConversation) {
      conversations.value = upsertConversation(conversations.value, {
        ...targetConversation,
        latestMessagePreview: message.content,
        latestMessageTime: message.createTime,
        latestSequence: message.sequence,
        unreadCount:
          activeConversation.value?.id === message.conversationId || isSelf
            ? 0
            : targetConversation.unreadCount + 1,
      })
    }

    if (activeConversation.value?.id === message.conversationId) {
      activeConversation.value = {
        ...activeConversation.value,
        latestMessagePreview: message.content,
        latestMessageTime: message.createTime,
        latestSequence: message.sequence,
        unreadCount: 0,
      }
    }
  }

  async function bootstrapConversations() {
    isConversationsLoading.value = true

    try {
      conversations.value = (await imService.listConversations()).sort(sortConversations)
      void ensureSocketConnected()
    }
    finally {
      isConversationsLoading.value = false
    }
  }

  async function loadConversationDetail(conversationId: number) {
    const conversation = await imService.getConversationDetail(conversationId)
    setConversationDetail(conversation)
    return conversation
  }

  async function loadMessages(conversationId: number) {
    isMessagesLoading.value = true

    try {
      const messages = await imService.listMessages(conversationId)
      setMessages(conversationId, messages)
      return messages
    }
    finally {
      isMessagesLoading.value = false
    }
  }

  async function openConversation(conversationId: number) {
    const [conversation, messages] = await Promise.all([
      loadConversationDetail(conversationId),
      loadMessages(conversationId),
    ])

    const latestSequence = messages[messages.length - 1]?.sequence ?? 0
    if (latestSequence > 0) {
      await markConversationRead(conversationId, latestSequence)
    }

    return conversation
  }

  async function createSingleConversation(targetUserId: number) {
    const conversation = await imService.createSingleConversation(targetUserId)
    setConversationDetail(conversation)
    return conversation
  }

  async function createGroupConversation(draft: CreateGroupConversationDraft) {
    const conversation = await imService.createGroupConversation(draft)
    setConversationDetail(conversation)
    return conversation
  }

  async function sendMessage(conversationId: number, content: string) {
    isSendingMessage.value = true

    try {
      const message = await imService.sendMessage(conversationId, content)
      appendMessage(message)
      await markConversationRead(conversationId, message.sequence)
      return message
    }
    finally {
      isSendingMessage.value = false
    }
  }

  async function markConversationRead(conversationId: number, readSequence: number) {
    const member = await imService.markConversationRead(conversationId, readSequence)
    applyReadState(conversationId, member)
    return member
  }

  function applyReadState(conversationId: number, member: ConversationMember) {
    if (activeConversation.value?.id === conversationId) {
      activeConversation.value = {
        ...activeConversation.value,
        unreadCount: 0,
        members: activeConversation.value.members.map((item) =>
          item.userId === member.userId
            ? {
                ...item,
                lastReadSequence: member.lastReadSequence,
              }
            : item),
      }
    }

    conversations.value = conversations.value.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            unreadCount: 0,
          }
        : conversation)
  }

  async function addGroupMembers(conversationId: number, userIds: number[]) {
    const conversation = await imService.addGroupMembers(conversationId, userIds)
    setConversationDetail(conversation)
    return conversation
  }

  async function removeGroupMember(conversationId: number, userId: number) {
    const conversation = await imService.removeGroupMember(conversationId, userId)
    setConversationDetail(conversation)
    return conversation
  }

  async function quitGroup(conversationId: number) {
    const conversation = await imService.quitGroup(conversationId)
    setConversationDetail(conversation)
    return conversation
  }

  async function ensureSocketConnected() {
    const authStore = useAuthStore(pinia)
    const accessToken = authStore.currentSession?.token.accessToken
    const wsUrl = deriveWsUrl()

    if (!accessToken || !wsUrl || typeof window === 'undefined') {
      return
    }

    if (socket.value && (socket.value.readyState === WebSocket.OPEN || socket.value.readyState === WebSocket.CONNECTING)) {
      return
    }

    socketStatus.value = 'connecting'
    socketError.value = ''

    try {
      const url = new URL(wsUrl, window.location.origin)
      url.searchParams.set('token', accessToken)
      socket.value = new WebSocket(url.toString())
      socket.value.onopen = () => {
        socketStatus.value = 'connected'
      }
      socket.value.onclose = () => {
        socketStatus.value = 'disconnected'
      }
      socket.value.onerror = () => {
        socketError.value = 'IM 实时连接不可用，当前已回退到 HTTP 轮询加载。'
      }
      socket.value.onmessage = (event) => {
        handleSocketMessage(event.data)
      }
    }
    catch {
      socketStatus.value = 'disconnected'
      socketError.value = 'IM 实时连接不可用，当前已回退到 HTTP 轮询加载。'
    }
  }

  function handleSocketMessage(raw: string) {
    try {
      const event = JSON.parse(raw) as ImSocketEnvelope<ImMessage | { conversationId: number, member: ConversationMember }>
      if (event.type === 'message.new') {
        const message = event.data as ImMessage
        appendMessage(message)
        if (activeConversation.value?.id === message.conversationId) {
          void markConversationRead(message.conversationId, message.sequence)
        }
        return
      }

      if (event.type === 'conversation.read') {
        const payload = event.data as { conversationId: number, member: ConversationMember }
        applyReadState(payload.conversationId, payload.member)
      }
    }
    catch {
      socketError.value = '收到无法解析的实时消息，已忽略。'
    }
  }

  function disconnectSocket() {
    socket.value?.close()
    socket.value = null
    socketStatus.value = 'disconnected'
  }

  function resetState() {
    conversations.value = []
    activeConversation.value = null
    messagesByConversation.value = {}
    socketError.value = ''
    disconnectSocket()
  }

  return {
    activeConversation,
    addGroupMembers,
    bootstrapConversations,
    conversations,
    createGroupConversation,
    createSingleConversation,
    disconnectSocket,
    ensureSocketConnected,
    isConversationsLoading,
    isMessagesLoading,
    isSendingMessage,
    loadConversationDetail,
    loadMessages,
    markConversationRead,
    messagesByConversation,
    openConversation,
    quitGroup,
    removeGroupMember,
    resetState,
    sendMessage,
    socketError,
    socketStatus,
    totalUnreadCount,
  }
})
