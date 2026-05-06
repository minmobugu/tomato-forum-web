import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { communityService } from '../services/community'
import { useAuthStore } from './auth'
import { pinia } from './pinia'
import type {
  CommentItem,
  CommunityEvent,
  CreatePostDraft,
  FeedChannel,
  Game,
  HeroFeature,
  Post,
  PostInteractionState,
  TopbarMessage,
  UserProfile,
} from '../types/community'

type FeedType = '推荐' | '热门' | '最新'

function createDefaultInteraction(): PostInteractionState {
  return {
    liked: false,
    disliked: false,
    favorited: false,
  }
}

function upsertPost(posts: Post[], nextPost: Post) {
  const currentIndex = posts.findIndex((post) => post.id === nextPost.id)
  if (currentIndex === -1) {
    return [nextPost, ...posts]
  }

  const nextPosts = posts.slice()
  nextPosts[currentIndex] = nextPost
  return nextPosts
}

function appendReply(items: CommentItem[], targetCommentId: number, reply: CommentItem): CommentItem[] {
  return items.map((comment) => {
    if (comment.id === targetCommentId) {
      return {
        ...comment,
        replyCount: comment.replyCount + 1,
        replies: [...comment.replies, reply],
      }
    }

    if (!comment.replies.length) {
      return comment
    }

    return {
      ...comment,
      replies: appendReply(comment.replies, targetCommentId, reply),
    }
  })
}

function updatePostCounters(posts: Post[], payload: {
  postId: number
  commentCount: number
  likeCount: number
  dislikeCount: number
  favoriteCount: number
}) {
  return posts.map((post) => {
    if (post.id !== payload.postId) {
      return post
    }

    return {
      ...post,
      comments: payload.commentCount,
      likes: payload.likeCount,
      dislikes: payload.dislikeCount,
      favorites: payload.favoriteCount,
    }
  })
}

export const useCommunityStore = defineStore('community', () => {
  const heroFeature = ref<HeroFeature | null>(null)
  const feedChannels = ref<FeedChannel[]>([])
  const rankGroups = ref<Array<{ id: number; title: string; items: Array<{ id: number; title: string; subtitle: string; value: string; trend: string }> }>>([])
  const communityEvents = ref<CommunityEvent[]>([])
  const featuredGames = ref<Game[]>([])
  const posts = ref<Post[]>([])
  const comments = ref<CommentItem[]>([])
  const profile = ref<UserProfile | null>(null)
  const topbarMessages = ref<TopbarMessage[]>([])
  const activeFeed = ref<FeedType>('推荐')
  const activeChannel = ref('全部')
  const interactions = ref<Record<number, PostInteractionState>>({})
  const isPostsLoading = ref(false)
  const isSubmittingPost = ref(false)
  const isSubmittingComment = ref(false)

  const trendingPosts = computed(() => posts.value.slice().sort((a, b) => b.likes - a.likes))
  const latestPosts = computed(() => posts.value.slice())
  const filteredPosts = computed(() => posts.value)
  const visiblePosts = computed(() => posts.value)
  const unreadMessageCount = computed(() => topbarMessages.value.filter((message) => !message.isRead).length)

  function resolveSortType() {
    return activeFeed.value === '热门' ? 'HOT' : 'LATEST'
  }

  function ensureInteraction(postId: number) {
    if (!interactions.value[postId]) {
      interactions.value[postId] = createDefaultInteraction()
    }

    return interactions.value[postId]
  }

  function syncInteractions(nextPosts: Post[]) {
    for (const post of nextPosts) {
      ensureInteraction(post.id)
    }
  }

  async function loadPosts() {
    isPostsLoading.value = true

    try {
      const nextPosts = await communityService.getPosts({
        channel: activeChannel.value,
        sortType: resolveSortType(),
      })

      posts.value = nextPosts
      syncInteractions(nextPosts)
    }
    finally {
      isPostsLoading.value = false
    }
  }

  async function bootstrapHome() {
    const [heroData, channelsData, rankData, eventsData, gamesData] = await Promise.all([
      communityService.getHeroFeature(),
      communityService.getFeedChannels(),
      communityService.getRankGroups(),
      communityService.getCommunityEvents(),
      communityService.getFeaturedGames(),
    ])

    heroFeature.value = heroData
    feedChannels.value = channelsData
    rankGroups.value = rankData
    communityEvents.value = eventsData
    featuredGames.value = gamesData

    await loadPosts()
  }

  async function loadTopbarData() {
    if (!topbarMessages.value.length) {
      topbarMessages.value = await communityService.getTopbarMessages()
    }

    if (!featuredGames.value.length || !posts.value.length || !feedChannels.value.length) {
      await bootstrapHome()
    }

    if (!profile.value) {
      profile.value = await communityService.getProfile()
    }
  }

  async function loadPostDetail(id: number) {
    const [post, postComments] = await Promise.all([
      communityService.getPostById(id),
      communityService.getCommentsByPostId(id),
    ])

    comments.value = postComments
    posts.value = upsertPost(posts.value, post)
    ensureInteraction(post.id)

    return post
  }

  async function loadProfile() {
    profile.value = await communityService.getProfile()
  }

  function setActiveFeed(feed: FeedType) {
    activeFeed.value = feed
    void loadPosts()
  }

  function setActiveChannel(channel: string) {
    activeChannel.value = channel
    void loadPosts()
  }

  function markMessageRead(messageId: number) {
    const message = topbarMessages.value.find((item) => item.id === messageId)
    if (!message) return

    message.isRead = true
  }

  async function publishPost(draft: CreatePostDraft) {
    isSubmittingPost.value = true

    try {
      const post = await communityService.createPost(draft)
      posts.value = upsertPost(posts.value, post)
      ensureInteraction(post.id)
      return post
    }
    finally {
      isSubmittingPost.value = false
    }
  }

  function requireAuth() {
    const authStore = useAuthStore(pinia)
    if (authStore.isAuthenticated) {
      return true
    }

    authStore.openAuthModal()
    return false
  }

  function applyInteractionUpdate(payload: {
    postId: number
    commentCount: number
    likeCount: number
    dislikeCount: number
    favoriteCount: number
    liked: boolean
    disliked: boolean
    favorited: boolean
  }) {
    posts.value = updatePostCounters(posts.value, payload)
    interactions.value[payload.postId] = {
      liked: payload.liked,
      disliked: payload.disliked,
      favorited: payload.favorited,
    }
  }

  async function toggleLike(postId: number) {
    if (!requireAuth()) {
      return
    }

    const result = await communityService.toggleLike(postId, ensureInteraction(postId))
    applyInteractionUpdate(result)
  }

  async function toggleDislike(postId: number) {
    if (!requireAuth()) {
      return
    }

    const result = await communityService.toggleDislike(postId, ensureInteraction(postId))
    applyInteractionUpdate(result)
  }

  async function toggleFavorite(postId: number) {
    if (!requireAuth()) {
      return
    }

    const result = await communityService.toggleFavorite(postId, ensureInteraction(postId))
    applyInteractionUpdate(result)
  }

  async function submitComment(postId: number, content: string) {
    if (!requireAuth()) {
      return null
    }

    isSubmittingComment.value = true

    try {
      const comment = await communityService.createComment(postId, content)
      comments.value = [comment, ...comments.value]
      const post = posts.value.find((item) => item.id === postId)
      if (post) {
        post.comments += 1
      }
      return comment
    }
    finally {
      isSubmittingComment.value = false
    }
  }

  async function submitReply(postId: number, commentId: number, content: string) {
    if (!requireAuth()) {
      return null
    }

    isSubmittingComment.value = true

    try {
      const reply = await communityService.replyComment(postId, commentId, content)
      comments.value = appendReply(comments.value, commentId, reply)
      const post = posts.value.find((item) => item.id === postId)
      if (post) {
        post.comments += 1
      }
      return reply
    }
    finally {
      isSubmittingComment.value = false
    }
  }

  return {
    activeChannel,
    activeFeed,
    bootstrapHome,
    comments,
    communityEvents,
    feedChannels,
    featuredGames,
    filteredPosts,
    heroFeature,
    interactions,
    isPostsLoading,
    isSubmittingComment,
    isSubmittingPost,
    latestPosts,
    loadPostDetail,
    loadPosts,
    loadProfile,
    loadTopbarData,
    markMessageRead,
    posts,
    profile,
    publishPost,
    rankGroups,
    setActiveChannel,
    setActiveFeed,
    submitComment,
    submitReply,
    toggleDislike,
    toggleFavorite,
    toggleLike,
    topbarMessages,
    trendingPosts,
    unreadMessageCount,
    visiblePosts,
  }
})
