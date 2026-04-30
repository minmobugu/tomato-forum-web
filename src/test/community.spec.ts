import { describe, expect, it } from 'vitest'

import { communityService } from '../services/community'

describe('communityService', () => {
  it('returns seeded featured games and posts', async () => {
    const games = await communityService.getFeaturedGames()
    const posts = await communityService.getPosts()

    expect(games.length).toBeGreaterThan(0)
    expect(posts.length).toBeGreaterThan(0)
  })

  it('returns fallback post when post id is missing', async () => {
    const post = await communityService.getPostById(-1)

    expect(post.id).toBe(101)
  })

  it('filters comments by post id', async () => {
    const matchedComments = await communityService.getCommentsByPostId(101)
    const missingComments = await communityService.getCommentsByPostId(999)

    expect(matchedComments.length).toBeGreaterThan(0)
    expect(matchedComments.every((comment) => comment.postId === 101)).toBe(true)
    expect(missingComments).toHaveLength(0)
  })

  it('returns cloned data instead of mutating the mock source', async () => {
    const messages = await communityService.getTopbarMessages()
    messages[0].isRead = true

    const nextMessages = await communityService.getTopbarMessages()

    expect(nextMessages[0].isRead).toBe(false)
  })
})
