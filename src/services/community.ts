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
} from '../mock/community'

export const communityService = {
  getHeroFeature() {
    return Promise.resolve(heroFeature)
  },
  getFeedChannels() {
    return Promise.resolve(feedChannels)
  },
  getRankGroups() {
    return Promise.resolve(rankGroups)
  },
  getCommunityEvents() {
    return Promise.resolve(communityEvents)
  },
  getFeaturedGames() {
    return Promise.resolve(featuredGames)
  },
  getPosts() {
    return Promise.resolve(posts)
  },
  getPostById(id: number) {
    return Promise.resolve(posts.find((post) => post.id === id) ?? posts[0])
  },
  getCommentsByPostId() {
    return Promise.resolve(comments)
  },
  getProfile() {
    return Promise.resolve(userProfile)
  },
  getTopbarMessages() {
    return Promise.resolve(topbarMessages)
  },
}
