import type { AxiosResponse } from 'axios'

import { apiClient, extractApiErrorMessage } from '../http'
import type { ImService } from '../im'
import type {
  ConversationDetail,
  ConversationMember,
  ConversationSummary,
  CreateGroupConversationDraft,
  ImMessage,
  ImUserProfile,
} from '../../types/im'
import { readStoredAuthSession } from '../../utils/authSession'

interface ImApiResponse<T> {
  success?: boolean
  message?: string
  errorCode?: string
  data?: T | null
}

interface ConversationMemberDto {
  userId: number
  role: 'OWNER' | 'MEMBER'
  status: 'ACTIVE' | 'QUIT' | 'REMOVED'
  lastReadSequence: number
}

interface ConversationSummaryDto {
  id: number
  conversationType: 'SINGLE' | 'GROUP'
  displayName: string
  avatarUrl?: string | null
  latestMessagePreview?: string | null
  latestMessageTime?: string | null
  latestSequence: number
  unreadCount: number
}

interface ConversationDetailDto extends ConversationSummaryDto {
  members?: ConversationMemberDto[]
}

interface MessageDto {
  id: number
  conversationId: number
  senderId: number
  messageType: 'TEXT' | 'SYSTEM'
  sequence: number
  content: string
  createTime: string
}

function createUserProfile(userId: number): ImUserProfile {
  const session = readStoredAuthSession()
  if (session?.user.id === userId) {
    return {
      id: userId,
      displayName: session.user.name,
      avatarUrl: session.user.avatar,
    }
  }

  return {
    id: userId,
    displayName: `用户 ${userId}`,
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=User-${userId}`,
  }
}

function mapConversationMember(dto: ConversationMemberDto): ConversationMember {
  return {
    userId: dto.userId,
    role: dto.role,
    status: dto.status,
    lastReadSequence: dto.lastReadSequence,
    profile: createUserProfile(dto.userId),
  }
}

function mapConversationSummary(dto: ConversationSummaryDto): ConversationSummary {
  return {
    id: dto.id,
    conversationType: dto.conversationType,
    displayName: dto.displayName,
    avatarUrl: dto.avatarUrl ?? null,
    latestMessagePreview: dto.latestMessagePreview ?? null,
    latestMessageTime: dto.latestMessageTime ?? null,
    latestSequence: dto.latestSequence,
    unreadCount: dto.unreadCount,
  }
}

function mapConversationDetail(dto: ConversationDetailDto): ConversationDetail {
  return {
    ...mapConversationSummary(dto),
    members: (dto.members ?? []).map(mapConversationMember),
  }
}

function mapMessage(dto: MessageDto): ImMessage {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    senderId: dto.senderId,
    messageType: dto.messageType,
    sequence: dto.sequence,
    content: dto.content,
    createTime: dto.createTime,
  }
}

async function unwrapImResponse<T>(
  request: Promise<AxiosResponse<ImApiResponse<T>>>,
  fallbackMessage: string,
  options?: { allowNullData?: boolean },
) {
  try {
    const response = await request
    const body = response.data

    if (body.success === false) {
      throw new Error(body.message || fallbackMessage)
    }

    if (!options?.allowNullData && body.data == null) {
      throw new Error(body.message || fallbackMessage)
    }

    return body.data as T
  }
  catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage), { cause: error })
  }
}

export const apiImService: ImService = {
  async createSingleConversation(targetUserId: number) {
    const data = await unwrapImResponse<ConversationDetailDto>(
      apiClient.post('/api/im/conversations/single', { targetUserId }),
      '创建私聊失败',
    )

    return mapConversationDetail(data)
  },

  async createGroupConversation(draft: CreateGroupConversationDraft) {
    const data = await unwrapImResponse<ConversationDetailDto>(
      apiClient.post('/api/im/conversations/group', {
        name: draft.name.trim(),
        avatarUrl: draft.avatarUrl.trim() || undefined,
        memberUserIds: draft.memberUserIds,
      }),
      '创建群聊失败',
    )

    return mapConversationDetail(data)
  },

  async listConversations() {
    const response = await apiClient.get<ImApiResponse<ConversationSummaryDto[]>>('/api/im/conversations', {
      params: {
        pageNum: 1,
        pageSize: 50,
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || '加载会话列表失败')
    }

    return (response.data.data ?? []).map(mapConversationSummary)
  },

  async getConversationDetail(conversationId: number) {
    const data = await unwrapImResponse<ConversationDetailDto>(
      apiClient.get(`/api/im/conversations/${conversationId}`),
      '加载会话详情失败',
    )

    return mapConversationDetail(data)
  },

  async listMessages(conversationId: number, options?: { fromSequence?: number | null }) {
    const response = await apiClient.get<ImApiResponse<MessageDto[]>>(
      `/api/im/conversations/${conversationId}/messages`,
      {
        params: {
          pageNum: 1,
          pageSize: 50,
          fromSequence: options?.fromSequence ?? undefined,
        },
      },
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || '加载消息历史失败')
    }

    return (response.data.data ?? []).map(mapMessage)
  },

  async sendMessage(conversationId: number, content: string) {
    const data = await unwrapImResponse<MessageDto>(
      apiClient.post(`/api/im/conversations/${conversationId}/messages`, {
        content: content.trim(),
      }),
      '发送消息失败',
    )

    return mapMessage(data)
  },

  async markConversationRead(conversationId: number, readSequence: number) {
    const data = await unwrapImResponse<ConversationMemberDto>(
      apiClient.put(`/api/im/conversations/${conversationId}/read`, {
        readSequence,
      }),
      '更新已读失败',
    )

    return mapConversationMember(data)
  },

  async addGroupMembers(conversationId: number, userIds: number[]) {
    const data = await unwrapImResponse<ConversationDetailDto>(
      apiClient.post(`/api/im/groups/${conversationId}/members`, {
        userIds,
      }),
      '添加群成员失败',
    )

    return mapConversationDetail(data)
  },

  async removeGroupMember(conversationId: number, userId: number) {
    const data = await unwrapImResponse<ConversationDetailDto>(
      apiClient.delete(`/api/im/groups/${conversationId}/members/${userId}`),
      '移除群成员失败',
    )

    return mapConversationDetail(data)
  },

  async quitGroup(conversationId: number) {
    const data = await unwrapImResponse<ConversationDetailDto>(
      apiClient.post(`/api/im/groups/${conversationId}/quit`),
      '退群失败',
    )

    return mapConversationDetail(data)
  },
}
