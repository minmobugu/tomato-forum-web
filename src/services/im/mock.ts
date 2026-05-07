import { imConversations, imMessages } from '../../mock/im'
import type { ConversationDetail, ConversationMember, ConversationSummary, CreateGroupConversationDraft, ImUserProfile } from '../../types/im'
import type { ImService } from '../im'

function cloneData<T>(data: T): T {
  return structuredClone(data)
}

function toSummary(conversation: ConversationDetail): ConversationSummary {
  const { members, ...summary } = conversation
  return summary
}

function createUserProfile(userId: number): ImUserProfile {
  return {
    id: userId,
    displayName: `用户 ${userId}`,
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=User-${userId}`,
  }
}

function createConversationMember(userId: number): ConversationMember {
  return {
    userId,
    role: 'MEMBER',
    status: 'ACTIVE',
    lastReadSequence: 0,
    profile: createUserProfile(userId),
  }
}

export const mockImService: ImService = {
  async createSingleConversation(targetUserId: number) {
    const existing = imConversations.find(
      (conversation) =>
        conversation.conversationType === 'SINGLE'
        && conversation.members.some((member) => member.userId === targetUserId),
    )

    if (existing) {
      return cloneData(existing)
    }

    const conversation: ConversationDetail = {
      id: Math.max(...imConversations.map((item) => item.id), 5000) + 1,
      conversationType: 'SINGLE',
      displayName: `用户 ${targetUserId}`,
      avatarUrl: createUserProfile(targetUserId).avatarUrl,
      latestMessagePreview: null,
      latestMessageTime: null,
      latestSequence: 0,
      unreadCount: 0,
      members: [createConversationMember(999), createConversationMember(targetUserId)],
    }

    return cloneData(conversation)
  },

  async createGroupConversation(draft: CreateGroupConversationDraft) {
    const conversation: ConversationDetail = {
      id: Math.max(...imConversations.map((item) => item.id), 5000) + 1,
      conversationType: 'GROUP',
      displayName: draft.name,
      avatarUrl: draft.avatarUrl || null,
      latestMessagePreview: '群聊已创建',
      latestMessageTime: new Date().toISOString(),
      latestSequence: 1,
      unreadCount: 0,
      members: [
        {
          ...createConversationMember(999),
          role: 'OWNER',
        },
        ...draft.memberUserIds.map(createConversationMember),
      ],
    }

    return cloneData(conversation)
  },

  async listConversations() {
    return cloneData(imConversations.map(toSummary))
  },

  async getConversationDetail(conversationId: number) {
    const conversation = imConversations.find((item) => item.id === conversationId) ?? imConversations[0]
    return cloneData(conversation)
  },

  async listMessages(conversationId: number, options?: { fromSequence?: number | null }) {
    const messages = imMessages[conversationId] ?? []
    if (options?.fromSequence != null) {
      const fromSequence = options.fromSequence
      return cloneData(messages.filter((message) => message.sequence < fromSequence))
    }

    return cloneData(messages)
  },

  async sendMessage(conversationId: number, content: string) {
    const messages = imMessages[conversationId] ?? []

    return cloneData({
      id: Math.max(...messages.map((message) => message.id), 9000) + 1,
      conversationId,
      senderId: 999,
      messageType: 'TEXT' as const,
      sequence: Math.max(...messages.map((message) => message.sequence), 0) + 1,
      content,
      createTime: new Date().toISOString(),
    })
  },

  async markConversationRead(conversationId: number, readSequence: number) {
    const conversation = imConversations.find((item) => item.id === conversationId) ?? imConversations[0]
    const currentMember = conversation.members.find((member) => member.userId === 999) ?? conversation.members[0]

    return cloneData({
      ...currentMember,
      lastReadSequence: readSequence,
    })
  },

  async addGroupMembers(conversationId: number, userIds: number[]) {
    const conversation = imConversations.find((item) => item.id === conversationId) ?? imConversations[0]

    return cloneData({
      ...conversation,
      members: [
        ...conversation.members,
        ...userIds
          .filter((userId) => !conversation.members.some((member) => member.userId === userId))
          .map(createConversationMember),
      ],
    })
  },

  async removeGroupMember(conversationId: number, userId: number) {
    const conversation = imConversations.find((item) => item.id === conversationId) ?? imConversations[0]

    return cloneData({
      ...conversation,
      members: conversation.members.filter((member) => member.userId !== userId),
    })
  },

  async quitGroup(conversationId: number) {
    const conversation = imConversations.find((item) => item.id === conversationId) ?? imConversations[0]

    return cloneData({
      ...conversation,
      members: conversation.members.map((member) =>
        member.userId === 999
          ? {
              ...member,
              status: 'QUIT',
            }
          : member),
    })
  },
}
