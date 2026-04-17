import type { AuthSession } from '../types/auth'

export const mockAuthSession: AuthSession = {
  user: {
    id: 999,
    name: '小番茄站长',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Tomato',
    handle: '@tomato_player',
    phone: '13800000000',
  },
  token: 'mock-auth-token',
}
