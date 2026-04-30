export interface Author {
  id: number
  name: string
  avatar: string
  level: string
  isOnline?: boolean
}

export interface PostMediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  name: string
  poster?: string
}

export interface Post {
  id: number
  title: string
  summary: string
  cover: string
  game: string
  topic: string
  author: Author
  publishTime: string
  content: string[]
  media: PostMediaItem[]
  likes: number
  comments: number
  favorites: number
  views: string
  readingTime: string
  tags: string[]
  featured?: boolean
}

export interface Game {
  id: number
  name: string
  genre: string
  status: string
  cover: string
  followers: string
  heat: string
  summary: string
  tags: string[]
}

export interface FeedChannel {
  id: number
  name: string
  icon: string
  description: string
  accent: string
}

export interface TopbarMessage {
  id: number
  title: string
  content: string
  publishTime: string
  type: 'comment' | 'like' | 'favorite' | 'system'
  isRead: boolean
  postId?: number
  route?: {
    name: 'home' | 'games' | 'profile'
    query?: Record<string, string>
  }
}

export interface CreatePostDraft {
  title: string
  game: string
  topic: string
  summary: string
  content: string
  images: PostMediaItem[]
  videos: PostMediaItem[]
}

export interface HeroFeature {
  id: number
  title: string
  subtitle: string
  cover: string
  badge: string
  metrics: Array<{
    label: string
    value: string
  }>
}

export interface CommunityRankItem {
  id: number
  title: string
  subtitle: string
  value: string
  trend: string
}

export interface CommunityEvent {
  id: number
  title: string
  subtitle: string
  cta: string
  status: string
}

export interface ProfileStats {
  label: string
  value: string
}

export interface UserProfile {
  name: string
  handle: string
  bio: string
  avatar: string
  stats: ProfileStats[]
  badges: string[]
  favoriteGames: string[]
  traits: string[]
}

export interface CommentItem {
  id: number
  postId: number
  author: Author
  content: string
  publishTime: string
  likes: number
}

export interface PostInteractionState {
  liked: boolean
  favorited: boolean
}
