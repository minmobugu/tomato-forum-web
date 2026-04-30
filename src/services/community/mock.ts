import {
  comments,
  communityEvents,
  featuredGames,
  feedChannels,
  heroFeature,
  posts,
  rankGroups,
  topbarMessages,
  userProfile,
} from '../../mock/community'

function cloneData<T>(data: T): T {
  return structuredClone(data)
}

export const mockCommunityService = {
  async getHeroFeature() {
    return cloneData(heroFeature)
  },

  async getFeedChannels() {
    return cloneData(feedChannels)
  },

  async getRankGroups() {
    return cloneData(rankGroups)
  },

  async getCommunityEvents() {
    return cloneData(communityEvents)
  },

  async getFeaturedGames() {
    return cloneData(featuredGames)
  },

  async getPosts() {
    return cloneData(posts)
  },

  async getPostById(id: number) {
    return cloneData(posts.find((post) => post.id === id) ?? posts[0])
  },

  async getCommentsByPostId(postId: number) {
    return cloneData(comments.filter((comment) => comment.postId === postId))
  },

  async getProfile() {
    return cloneData(userProfile)
  },

  async getTopbarMessages() {
    return cloneData(topbarMessages)
  },
}
