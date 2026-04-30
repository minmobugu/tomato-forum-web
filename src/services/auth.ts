import { apiClient, unwrapApiResponse } from './http'
import type {
  AuthSession,
  AuthUser,
  LoginResult,
  LoginWithCodePayload,
  LoginWithPasswordPayload,
  PasswordLoginRequest,
  SendSmsCodePayload,
  SmsCodeSendResult,
  SmsLoginRequest,
  UserProfile,
} from '../types/auth'

const defaultAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=Tomato'

function trimValue(value: string) {
  return value.trim()
}

function mapUserProfileToAuthUser(profile: UserProfile, phone?: string): AuthUser {
  return {
    id: profile.id,
    name: profile.nickname || profile.username,
    avatar: profile.avatar || defaultAvatar,
    handle: `@${profile.username}`,
    phone,
    username: profile.username,
    nickname: profile.nickname,
    bio: profile.bio,
    createdAt: profile.createdAt,
  }
}

function toAuthSession(result: LoginResult, phone?: string): AuthSession {
  return {
    user: mapUserProfileToAuthUser(result.user, phone),
    token: result.token,
    isNewUser: result.isNewUser,
  }
}

export const authService = {
  sendCode(phone: string) {
    const normalizedPhone = trimValue(phone)

    if (!normalizedPhone) {
      return Promise.reject(new Error('请输入手机号'))
    }

    const payload: SendSmsCodePayload = {
      phone: normalizedPhone,
      scene: 'login',
    }

    return unwrapApiResponse<SmsCodeSendResult>(
      apiClient.post('/api/v1/auth/sms-code', payload),
      '发送验证码失败',
    )
  },

  async loginWithCode(payload: LoginWithCodePayload) {
    const phone = trimValue(payload.phone)
    const code = trimValue(payload.code)

    if (!phone || !code) {
      throw new Error('请填写手机号和验证码')
    }

    const requestBody: SmsLoginRequest = {
      phone,
      smsCode: code,
    }

    const result = await unwrapApiResponse<LoginResult>(
      apiClient.post('/api/v1/auth/login/sms', requestBody),
      '登录失败',
    )

    return toAuthSession(result, phone)
  },

  async loginWithPassword(payload: LoginWithPasswordPayload) {
    const phone = trimValue(payload.phone)
    const password = trimValue(payload.password)

    if (!phone || !password) {
      throw new Error('请填写手机号和密码')
    }

    const requestBody: PasswordLoginRequest = {
      phone,
      password,
    }

    const result = await unwrapApiResponse<LoginResult>(
      apiClient.post('/api/v1/auth/login/password', requestBody),
      '登录失败',
    )

    return toAuthSession(result, phone)
  },

  async logout() {
    await unwrapApiResponse<null>(
      apiClient.post('/api/v1/auth/logout'),
      '退出登录失败',
      { allowNullData: true },
    )
  },
}
