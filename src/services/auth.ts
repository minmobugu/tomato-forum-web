import { mockAuthSession } from '../mock/auth'
import type { AuthSession, LoginWithCodePayload, LoginWithPasswordPayload } from '../types/auth'

function createSession(phone: string): AuthSession {
  return {
    ...mockAuthSession,
    user: {
      ...mockAuthSession.user,
      phone,
    },
    token: `${mockAuthSession.token}-${phone}`,
  }
}

export const authService = {
  sendCode(phone: string) {
    if (!phone.trim()) {
      return Promise.reject(new Error('请输入手机号'))
    }

    return Promise.resolve({ success: true })
  },
  loginWithCode(payload: LoginWithCodePayload) {
    if (!payload.phone.trim() || !payload.code.trim()) {
      return Promise.reject(new Error('请填写手机号和验证码'))
    }

    return Promise.resolve(createSession(payload.phone.trim()))
  },
  loginWithPassword(payload: LoginWithPasswordPayload) {
    if (!payload.phone.trim() || !payload.password.trim()) {
      return Promise.reject(new Error('请填写手机号和密码'))
    }

    return Promise.resolve(createSession(payload.phone.trim()))
  },
}
