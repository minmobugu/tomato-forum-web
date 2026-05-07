export type ConversationType = 'SINGLE' | 'GROUP'
export type ConversationMemberRole = 'OWNER' | 'MEMBER'
export type ConversationMemberStatus = 'ACTIVE' | 'QUIT' | 'REMOVED'
export type ImMessageType = 'TEXT' | 'SYSTEM'
export type ImSocketStatus = 'disconnected' | 'connecting' | 'connected'

export interface ImUserProfile {
  id: number
  displayName: string
  avatarUrl: string
}

export interface ConversationMember {
  userId: number
  role: ConversationMemberRole
  status: ConversationMemberStatus
  lastReadSequence: number
  profile: ImUserProfile
}

export interface ConversationSummary {
  id: number
  conversationType: ConversationType
  displayName: string
  avatarUrl: string | null
  latestMessagePreview: string | null
  latestMessageTime: string | null
  latestSequence: number
  unreadCount: number
}

export interface ConversationDetail extends ConversationSummary {
  members: ConversationMember[]
}

export interface ImMessage {
  id: number
  conversationId: number
  senderId: number
  messageType: ImMessageType
  sequence: number
  content: string
  createTime: string
}

export interface CreateGroupConversationDraft {
  name: string
  avatarUrl: string
  memberUserIds: number[]
}

export interface ImSocketEnvelope<T = unknown> {
  type: 'message.new' | 'conversation.read' | 'group.member_joined' | 'group.member_quit' | 'group.member_removed'
  data: T
}
