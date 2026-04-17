export type AuthMode = 'code' | 'password'

export interface AuthUser {
  id: number
  name: string
  avatar: string
  handle: string
  phone: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export interface LoginWithCodePayload {
  phone: string
  code: string
}

export interface LoginWithPasswordPayload {
  phone: string
  password: string
}
