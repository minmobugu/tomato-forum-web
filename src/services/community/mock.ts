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
import type { CreatePostDraft, PostInteractionState } from '../../types/community'
import type { CommunityService } from '../community'

function cloneData<T>(data: T): T {
  return structuredClone(data)
}

export const mockCommunityService: CommunityService = {
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

  async getPosts(options?: {
    channel?: string
    sortType?: 'LATEST' | 'HOT'
  }) {
    let nextPosts = cloneData(posts)

    if (options?.channel && options.channel !== '全部') {
      nextPosts = nextPosts.filter((post) => post.channel === options.channel)
    }

    if (options?.sortType === 'HOT') {
      nextPosts.sort((a, b) => b.likes - a.likes)
    }

    return nextPosts
  },

  async getPostById(id: number) {
    return cloneData(posts.find((post) => post.id === id) ?? posts[0])
  },

  async getCommentsByPostId(postId: number) {
    return cloneData(comments.filter((comment) => comment.postId === postId))
  },

  async createPost(draft: CreatePostDraft) {
    const nextId = Math.max(...posts.map((post) => post.id), 100) + 1
    const media = [...draft.images, ...draft.videos]
    const cover = draft.images[0]?.url ?? draft.videos[0]?.poster ?? featuredGames[0]?.cover ?? ''

    return cloneData({
      id: nextId,
      title: draft.title,
      summary: draft.summary,
      cover,
      game: draft.game,
      channel: draft.channel,
      topic: draft.topic,
      author: {
        id: 999,
        name: userProfile.name,
        avatar: userProfile.avatar,
        level: 'Lv.1',
        isOnline: true,
      },
      publishTime: '刚刚',
      content: draft.content
        .split('\n')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      media,
      likes: 0,
      dislikes: 0,
      comments: 0,
      favorites: 0,
      views: '0',
      readingTime: `${Math.max(1, Math.ceil(draft.content.length / 120))} 分钟`,
      tags: [draft.channel, draft.topic || draft.game].filter(Boolean),
      featured: false,
    })
  },

  async createComment(postId: number, content: string) {
    return cloneData({
      id: Math.max(...comments.map((comment) => comment.id), 0) + 1,
      postId,
      parentCommentId: null,
      rootCommentId: null,
      replyUserId: null,
      author: {
        id: 999,
        name: userProfile.name,
        avatar: userProfile.avatar,
        level: 'Lv.1',
        isOnline: true,
      },
      content,
      publishTime: '刚刚',
      likes: 0,
      replyCount: 0,
      commentLevel: 'ROOT' as const,
      replies: [],
    })
  },

  async replyComment(postId: number, commentId: number, content: string) {
    const targetComment = comments.find((comment) => comment.id === commentId)

    return cloneData({
      id: Math.max(
        ...comments.flatMap((comment) => [comment.id, ...comment.replies.map((reply) => reply.id)]),
        0,
      ) + 1,
      postId,
      parentCommentId: commentId,
      rootCommentId: targetComment?.rootCommentId ?? commentId,
      replyUserId: targetComment?.author.id ?? null,
      author: {
        id: 999,
        name: userProfile.name,
        avatar: userProfile.avatar,
        level: 'Lv.1',
        isOnline: true,
      },
      content,
      publishTime: '刚刚',
      likes: 0,
      replyCount: 0,
      commentLevel: 'REPLY' as const,
      replies: [],
    })
  },

  async toggleLike(postId: number, interaction: PostInteractionState) {
    const post = posts.find((item) => item.id === postId)

    return cloneData({
      postId,
      commentCount: post?.comments ?? 0,
      likeCount: post?.likes ?? 0,
      dislikeCount: post?.dislikes ?? 0,
      favoriteCount: post?.favorites ?? 0,
      liked: !interaction.liked,
      disliked: false,
      favorited: interaction.favorited,
    })
  },

  async toggleDislike(postId: number, interaction: PostInteractionState) {
    const post = posts.find((item) => item.id === postId)

    return cloneData({
      postId,
      commentCount: post?.comments ?? 0,
      likeCount: post?.likes ?? 0,
      dislikeCount: post?.dislikes ?? 0,
      favoriteCount: post?.favorites ?? 0,
      liked: false,
      disliked: !interaction.disliked,
      favorited: interaction.favorited,
    })
  },

  async toggleFavorite(postId: number, interaction: PostInteractionState) {
    const post = posts.find((item) => item.id === postId)

    return cloneData({
      postId,
      commentCount: post?.comments ?? 0,
      likeCount: post?.likes ?? 0,
      dislikeCount: post?.dislikes ?? 0,
      favoriteCount: post?.favorites ?? 0,
      liked: interaction.liked,
      disliked: interaction.disliked,
      favorited: !interaction.favorited,
    })
  },

  async getProfile() {
    return cloneData(userProfile)
  },

  async getTopbarMessages() {
    return cloneData(topbarMessages)
  },
}
