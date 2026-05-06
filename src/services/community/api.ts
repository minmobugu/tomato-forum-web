import type { AxiosResponse } from 'axios'

import { apiClient, extractApiErrorMessage } from '../http'
import { mockCommunityService } from './mock'
import type { CommunityService } from '../community'
import type {
  Author,
  CommentItem,
  CreatePostDraft,
  Post,
} from '../../types/community'

interface CommunityApiResponse<T> {
  success?: boolean
  message?: string
  errorCode?: string
  data?: T | null
  pageNo?: number
  totalCount?: number
  pageSize?: number
  totalPage?: number
}

interface PostSummaryDto {
  id: number
  authorId: number
  title: string
  summary: string
  game: string
  channel: string
  topic?: string | null
  coverUrl: string
  status: string
  tags?: string[]
  likeCount: number
  dislikeCount?: number
  favoriteCount: number
  commentCount: number
  viewCount?: number
  createTime?: string
  updateTime?: string
}

interface PostMediaDto {
  mediaType: 'IMAGE' | 'VIDEO'
  url: string
  coverUrl?: string
}

interface PostDetailDto extends PostSummaryDto {
  content?: string
  medias?: PostMediaDto[]
  relatedPosts?: PostSummaryDto[]
}

interface CommentItemDto {
  id: number
  postId: number
  parentCommentId?: number | null
  rootCommentId?: number | null
  userId: number
  replyUserId?: number | null
  content: string
  commentLevel: 'ROOT' | 'REPLY'
  replyCount: number
  likeCount?: number
  createTime: string
  replies?: CommentItemDto[]
}

interface CommentInteractionDto {
  postId: number
  commentCount: number
  likeCount: number
  dislikeCount: number
  favoriteCount: number
  liked: boolean
  disliked: boolean
  favorited: boolean
}

function buildAuthor(userId: number): Author {
  return {
    id: userId,
    name: `用户 ${userId}`,
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=User-${userId}`,
    level: 'Lv.1',
    isOnline: false,
  }
}

function formatRelativeTime(value?: string) {
  if (!value) {
    return '刚刚'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000))

  if (diffMinutes < 1) {
    return '刚刚'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays} 天前`
  }

  return date.toLocaleDateString('zh-CN')
}

function formatViewCount(value?: number) {
  if (value == null) {
    return '0'
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }

  return String(value)
}

function estimateReadingTime(content?: string) {
  const totalLength = (content ?? '').trim().length
  return `${Math.max(1, Math.ceil(totalLength / 120))} 分钟`
}

function mapPostSummary(dto: PostSummaryDto): Post {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    cover: dto.coverUrl,
    game: dto.game,
    channel: dto.channel,
    topic: dto.topic ?? dto.channel,
    author: buildAuthor(dto.authorId),
    publishTime: formatRelativeTime(dto.updateTime ?? dto.createTime),
    content: [],
    media: [],
    likes: dto.likeCount,
    dislikes: dto.dislikeCount ?? 0,
    comments: dto.commentCount,
    favorites: dto.favoriteCount,
    views: formatViewCount(dto.viewCount),
    readingTime: '1 分钟',
    tags: dto.tags ?? [dto.channel, dto.game].filter(Boolean),
    featured: false,
  }
}

function mapPostDetail(dto: PostDetailDto): Post {
  const content = dto.content ?? ''

  return {
    ...mapPostSummary(dto),
    content: content
      .split('\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    media: (dto.medias ?? []).map((item, index) => ({
      id: `${dto.id}-${index}`,
      type: item.mediaType === 'VIDEO' ? 'video' : 'image',
      url: item.url,
      name: `${dto.title}-${index + 1}`,
      poster: item.coverUrl,
    })),
    readingTime: estimateReadingTime(content),
  }
}

function mapCommentItem(dto: CommentItemDto): CommentItem {
  return {
    id: dto.id,
    postId: dto.postId,
    parentCommentId: dto.parentCommentId ?? null,
    rootCommentId: dto.rootCommentId ?? null,
    replyUserId: dto.replyUserId ?? null,
    author: buildAuthor(dto.userId),
    content: dto.content,
    publishTime: formatRelativeTime(dto.createTime),
    likes: dto.likeCount ?? 0,
    replyCount: dto.replyCount,
    commentLevel: dto.commentLevel,
    replies: (dto.replies ?? []).map(mapCommentItem),
  }
}

async function unwrapCommunityResponse<T>(
  request: Promise<AxiosResponse<CommunityApiResponse<T>>>,
  fallbackMessage: string,
  options?: { allowNullData?: boolean },
) {
  try {
    const response = await request
    const body = response.data

    if (body.success === false) {
      throw new Error(body.message || fallbackMessage)
    }

    if (!options?.allowNullData && body.data == null) {
      throw new Error(body.message || fallbackMessage)
    }

    return body.data as T
  }
  catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage), { cause: error })
  }
}

function toCreatePostPayload(draft: CreatePostDraft) {
  return {
    title: draft.title.trim(),
    game: draft.game.trim(),
    channel: draft.channel.trim(),
    topic: draft.topic.trim() || undefined,
    summary: draft.summary.trim(),
    content: draft.content.trim(),
    medias: [...draft.images, ...draft.videos].map((media) => ({
      mediaType: media.type === 'video' ? 'VIDEO' : 'IMAGE',
      url: media.url,
      coverUrl: media.poster,
    })),
    tags: [draft.channel.trim(), draft.topic.trim(), draft.game.trim()].filter(Boolean),
  }
}

export const apiCommunityService: CommunityService = {
  getHeroFeature: mockCommunityService.getHeroFeature,
  getFeedChannels: mockCommunityService.getFeedChannels,
  getRankGroups: mockCommunityService.getRankGroups,
  getCommunityEvents: mockCommunityService.getCommunityEvents,
  getFeaturedGames: mockCommunityService.getFeaturedGames,
  getProfile: mockCommunityService.getProfile,
  getTopbarMessages: mockCommunityService.getTopbarMessages,

  async getPosts(options) {
    const response = await apiClient.get<CommunityApiResponse<PostSummaryDto[]>>('/api/forum/posts', {
      params: {
        pageNum: 1,
        pageSize: 50,
        channel: options?.channel && options.channel !== '全部' ? options.channel : undefined,
        sortType: options?.sortType ?? 'LATEST',
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || '加载帖子列表失败')
    }

    return (response.data.data ?? []).map(mapPostSummary)
  },

  async getPostById(id: number) {
    const data = await unwrapCommunityResponse<PostDetailDto>(
      apiClient.get(`/api/forum/posts/${id}`),
      '加载帖子详情失败',
    )

    return mapPostDetail(data)
  },

  async getCommentsByPostId(postId: number) {
    const response = await apiClient.get<CommunityApiResponse<CommentItemDto[]>>(
      `/api/forum/posts/${postId}/comments`,
      {
        params: {
          pageNum: 1,
          pageSize: 50,
          sortType: 'TIME_DESC',
        },
      },
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || '加载评论失败')
    }

    return (response.data.data ?? []).map(mapCommentItem)
  },

  async createPost(draft) {
    const data = await unwrapCommunityResponse<PostDetailDto>(
      apiClient.post('/api/forum/posts', toCreatePostPayload(draft)),
      '发布帖子失败',
    )

    return mapPostDetail(data)
  },

  async createComment(postId: number, content: string) {
    const data = await unwrapCommunityResponse<CommentItemDto>(
      apiClient.post(`/api/forum/posts/${postId}/comments`, {
        content: content.trim(),
      }),
      '发表评论失败',
    )

    return mapCommentItem(data)
  },

  async replyComment(postId: number, commentId: number, content: string) {
    const data = await unwrapCommunityResponse<CommentItemDto>(
      apiClient.post(`/api/forum/posts/${postId}/comments/${commentId}/replies`, {
        content: content.trim(),
      }),
      '回复评论失败',
    )

    return mapCommentItem(data)
  },

  async toggleLike(postId: number) {
    const data = await unwrapCommunityResponse<CommentInteractionDto>(
      apiClient.put(`/api/forum/posts/${postId}/like`),
      '点赞失败',
    )

    return data
  },

  async toggleDislike(postId: number) {
    const data = await unwrapCommunityResponse<CommentInteractionDto>(
      apiClient.put(`/api/forum/posts/${postId}/dislike`),
      '点踩失败',
    )

    return data
  },

  async toggleFavorite(postId: number) {
    const data = await unwrapCommunityResponse<CommentInteractionDto>(
      apiClient.put(`/api/forum/posts/${postId}/favorite`),
      '收藏失败',
    )

    return data
  },
}
