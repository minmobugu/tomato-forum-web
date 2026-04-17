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
})
