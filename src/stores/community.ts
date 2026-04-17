import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { communityService } from '../services/community'
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
  const activeFeed = ref<'推荐' | '热门' | '最新'>('推荐')
  const activeChannel = ref('全部')
  const interactions = ref<Record<number, PostInteractionState>>({})

  const trendingPosts = computed(() => posts.value.slice().sort((a, b) => b.likes - a.likes))
  const latestPosts = computed(() => posts.value.slice().reverse())
  const filteredPosts = computed(() => {
    if (activeChannel.value === '全部') {
      return posts.value
    }

    return posts.value.filter(
      (post) => post.topic.includes(activeChannel.value) || post.tags.includes(activeChannel.value),
    )
  })
  const visiblePosts = computed(() => {
    const source = filteredPosts.value

    if (activeFeed.value === '热门') {
      return source.slice().sort((a, b) => b.likes - a.likes)
    }

    if (activeFeed.value === '最新') {
      return source.slice().reverse()
    }

    return source
  })
  const unreadMessageCount = computed(() => topbarMessages.value.filter((message) => !message.isRead).length)

  async function bootstrapHome() {
    const [heroData, channelsData, rankData, eventsData, gamesData, postsData] = await Promise.all([
      communityService.getHeroFeature(),
      communityService.getFeedChannels(),
      communityService.getRankGroups(),
      communityService.getCommunityEvents(),
      communityService.getFeaturedGames(),
      communityService.getPosts(),
    ])

    heroFeature.value = heroData
    feedChannels.value = channelsData
    rankGroups.value = rankData
    communityEvents.value = eventsData
    featuredGames.value = gamesData
    posts.value = postsData

    for (const post of postsData) {
      if (!interactions.value[post.id]) {
        interactions.value[post.id] = { liked: false, favorited: false }
      }
    }
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
      communityService.getCommentsByPostId(),
    ])

    comments.value = postComments
    return post
  }

  async function loadProfile() {
    profile.value = await communityService.getProfile()
  }

  function setActiveFeed(feed: '推荐' | '热门' | '最新') {
    activeFeed.value = feed
  }

  function setActiveChannel(channel: string) {
    activeChannel.value = channel
  }

  function markMessageRead(messageId: number) {
    const message = topbarMessages.value.find((item) => item.id === messageId)
    if (!message) return

    message.isRead = true
  }

  function publishPost(draft: CreatePostDraft) {
    const currentProfile = profile.value
    const nextId = Math.max(...posts.value.map((post) => post.id), 100) + 1
    const content = draft.content
      .split('\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    const media = [...draft.images, ...draft.videos]
    const fallbackCover =
      featuredGames.value.find((game) => game.name === draft.game)?.cover ??
      featuredGames.value[0]?.cover ??
      ''
    const cover = draft.images[0]?.url ?? draft.videos[0]?.poster ?? fallbackCover

    const post: Post = {
      id: nextId,
      title: draft.title,
      summary: draft.summary,
      cover,
      game: draft.game,
      topic: draft.topic,
      author: {
        id: 999,
        name: currentProfile?.name ?? '小番茄站长',
        avatar:
          currentProfile?.avatar ?? 'https://api.dicebear.com/9.x/adventurer/svg?seed=TomatoPublisher',
        level: 'Lv.28',
        isOnline: true,
      },
      publishTime: '刚刚',
      content: content.length ? content : [draft.content],
      media,
      likes: 0,
      comments: 0,
      favorites: 0,
      views: '0',
      readingTime: `${Math.max(1, Math.ceil(draft.content.length / 120))} 分钟`,
      tags: [draft.topic, draft.game, '新发布'],
      featured: false,
    }

    posts.value = [post, ...posts.value]
    interactions.value[post.id] = { liked: false, favorited: false }

    return post
  }

  function toggleLike(postId: number) {
    const current = interactions.value[postId]
    if (!current) return

    current.liked = !current.liked
  }

  function toggleFavorite(postId: number) {
    const current = interactions.value[postId]
    if (!current) return

    current.favorited = !current.favorited
  }

  return {
    activeChannel,
    activeFeed,
    comments,
    communityEvents,
    feedChannels,
    featuredGames,
    filteredPosts,
    heroFeature,
    interactions,
    latestPosts,
    loadPostDetail,
    loadProfile,
    loadTopbarData,
    markMessageRead,
    posts,
    profile,
    publishPost,
    rankGroups,
    setActiveChannel,
    setActiveFeed,
    bootstrapHome,
    toggleFavorite,
    toggleLike,
    topbarMessages,
    trendingPosts,
    unreadMessageCount,
    visiblePosts,
  }
})
