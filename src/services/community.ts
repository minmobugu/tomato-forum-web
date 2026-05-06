import { apiCommunityService } from './community/api'
import { mockCommunityService } from './community/mock'
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

export interface CommunityInteractionPayload {
  postId: number
  commentCount: number
  likeCount: number
  dislikeCount: number
  favoriteCount: number
  liked: boolean
  disliked: boolean
  favorited: boolean
}

export interface CommunityService {
  getHeroFeature(): Promise<HeroFeature>
  getFeedChannels(): Promise<FeedChannel[]>
  getRankGroups(): Promise<Array<{ id: number; title: string; items: Array<{ id: number; title: string; subtitle: string; value: string; trend: string }> }>>
  getCommunityEvents(): Promise<CommunityEvent[]>
  getFeaturedGames(): Promise<Game[]>
  getPosts(options?: { channel?: string; sortType?: 'LATEST' | 'HOT' }): Promise<Post[]>
  getPostById(id: number): Promise<Post>
  getCommentsByPostId(postId: number): Promise<CommentItem[]>
  createPost(draft: CreatePostDraft): Promise<Post>
  createComment(postId: number, content: string): Promise<CommentItem>
  replyComment(postId: number, commentId: number, content: string): Promise<CommentItem>
  toggleLike(postId: number, interaction: PostInteractionState): Promise<CommunityInteractionPayload>
  toggleDislike(postId: number, interaction: PostInteractionState): Promise<CommunityInteractionPayload>
  toggleFavorite(postId: number, interaction: PostInteractionState): Promise<CommunityInteractionPayload>
  getProfile(): Promise<UserProfile>
  getTopbarMessages(): Promise<TopbarMessage[]>
}

function resolveCommunityService() {
  return import.meta.env.VITE_COMMUNITY_DATA_SOURCE === 'api'
    ? apiCommunityService
    : mockCommunityService
}

export const communityService: CommunityService = resolveCommunityService()
