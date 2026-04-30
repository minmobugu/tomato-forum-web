import type { mockCommunityService } from './mock'

function createNotImplementedError(methodName: string) {
  return new Error(`社区接口模式已启用，但 ${methodName} 尚未按接口文档完成对接`)
}

export const apiCommunityService: typeof mockCommunityService = {
  async getHeroFeature() {
    throw createNotImplementedError('getHeroFeature')
  },

  async getFeedChannels() {
    throw createNotImplementedError('getFeedChannels')
  },

  async getRankGroups() {
    throw createNotImplementedError('getRankGroups')
  },

  async getCommunityEvents() {
    throw createNotImplementedError('getCommunityEvents')
  },

  async getFeaturedGames() {
    throw createNotImplementedError('getFeaturedGames')
  },

  async getPosts() {
    throw createNotImplementedError('getPosts')
  },

  async getPostById() {
    throw createNotImplementedError('getPostById')
  },

  async getCommentsByPostId() {
    throw createNotImplementedError('getCommentsByPostId')
  },

  async getProfile() {
    throw createNotImplementedError('getProfile')
  },

  async getTopbarMessages() {
    throw createNotImplementedError('getTopbarMessages')
  },
}
