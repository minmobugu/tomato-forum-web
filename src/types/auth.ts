export type AuthMode = 'code' | 'password'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
  timestamp: string
  traceId?: string
}

export interface AuthUser {
  id: number
  name: string
  avatar: string
  handle?: string
  phone?: string
  username: string
  nickname?: string
  bio?: string
  createdAt?: string
}

export interface JwtToken {
  accessToken: string
  tokenType: string
  expiresIn?: number
  refreshToken?: string | null
}

export interface AuthSession {
  user: AuthUser
  token: JwtToken
  isNewUser?: boolean
}

export interface SendSmsCodePayload {
  phone: string
  scene: 'login'
}

export interface SmsCodeSendResult {
  expireInSeconds: number
  dailyLimit: number
  remainingCount: number
}

export interface LoginWithCodePayload {
  phone: string
  code: string
}

export interface LoginWithPasswordPayload {
  phone: string
  password: string
}

export interface PasswordLoginRequest {
  phone: string
  password: string
}

export interface SmsLoginRequest {
  phone: string
  smsCode: string
}

export interface UserProfile {
  id: number
  username: string
  nickname?: string
  avatar?: string
  bio?: string
  createdAt?: string
}

export interface LoginResult {
  token: JwtToken
  user: UserProfile
  isNewUser?: boolean
}
