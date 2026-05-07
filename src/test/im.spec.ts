import { describe, expect, it } from 'vitest'

import { imService } from '../services/im'

describe('imService', () => {
  it('returns seeded conversations and messages', async () => {
    const conversations = await imService.listConversations()
    const messages = await imService.listMessages(conversations[0].id)

    expect(conversations.length).toBeGreaterThan(0)
    expect(messages.length).toBeGreaterThan(0)
  })

  it('creates or reuses a single conversation', async () => {
    const conversation = await imService.createSingleConversation(11)

    expect(conversation.conversationType).toBe('SINGLE')
    expect(conversation.members.some((member) => member.userId === 11)).toBe(true)
  })

  it('marks conversation as read', async () => {
    const conversations = await imService.listConversations()
    const member = await imService.markConversationRead(conversations[0].id, 6)

    expect(member.lastReadSequence).toBe(6)
  })
})
