import { apiImService } from './im/api'
import { mockImService } from './im/mock'
import type { ConversationDetail, ConversationMember, ConversationSummary, CreateGroupConversationDraft, ImMessage } from '../types/im'

export interface ImService {
  createSingleConversation(targetUserId: number): Promise<ConversationDetail>
  createGroupConversation(draft: CreateGroupConversationDraft): Promise<ConversationDetail>
  listConversations(): Promise<ConversationSummary[]>
  getConversationDetail(conversationId: number): Promise<ConversationDetail>
  listMessages(conversationId: number, options?: { fromSequence?: number | null }): Promise<ImMessage[]>
  sendMessage(conversationId: number, content: string): Promise<ImMessage>
  markConversationRead(conversationId: number, readSequence: number): Promise<ConversationMember>
  addGroupMembers(conversationId: number, userIds: number[]): Promise<ConversationDetail>
  removeGroupMember(conversationId: number, userId: number): Promise<ConversationDetail>
  quitGroup(conversationId: number): Promise<ConversationDetail>
}

function resolveImService() {
  return import.meta.env.VITE_IM_DATA_SOURCE === 'api'
    ? apiImService
    : mockImService
}

export const imService: ImService = resolveImService()
