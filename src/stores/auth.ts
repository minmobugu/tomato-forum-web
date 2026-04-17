import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocationRaw, Router } from 'vue-router'

import { authService } from '../services/auth'
import type { AuthMode, AuthSession, LoginWithCodePayload, LoginWithPasswordPayload } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentSession = ref<AuthSession | null>(null)
  const isAuthModalOpen = ref(false)
  const authMode = ref<AuthMode>('code')
  const isSendingCode = ref(false)
  const isSubmitting = ref(false)
  const authErrorMessage = ref('')
  const redirectTarget = ref<RouteLocationRaw | null>(null)

  const isAuthenticated = computed(() => Boolean(currentSession.value))
  const currentUser = computed(() => currentSession.value?.user ?? null)

  function openAuthModal(targetRoute?: RouteLocationRaw) {
    if (targetRoute) {
      redirectTarget.value = targetRoute
    }

    authErrorMessage.value = ''
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    authErrorMessage.value = ''
    isAuthModalOpen.value = false
  }

  function switchAuthMode(mode: AuthMode) {
    authErrorMessage.value = ''
    authMode.value = mode
  }

  async function sendVerificationCode(phone: string) {
    isSendingCode.value = true
    authErrorMessage.value = ''

    try {
      await authService.sendCode(phone)
    }
    catch (error) {
      authErrorMessage.value = error instanceof Error ? error.message : '发送验证码失败'
      throw error
    }
    finally {
      isSendingCode.value = false
    }
  }

  function completeLogin(session: AuthSession) {
    authErrorMessage.value = ''
    currentSession.value = session
    isAuthModalOpen.value = false
  }

  async function loginWithCode(payload: LoginWithCodePayload) {
    isSubmitting.value = true
    authErrorMessage.value = ''

    try {
      const session = await authService.loginWithCode(payload)
      completeLogin(session)
    }
    catch (error) {
      authErrorMessage.value = error instanceof Error ? error.message : '登录失败'
      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function loginWithPassword(payload: LoginWithPasswordPayload) {
    isSubmitting.value = true
    authErrorMessage.value = ''

    try {
      const session = await authService.loginWithPassword(payload)
      completeLogin(session)
    }
    catch (error) {
      authErrorMessage.value = error instanceof Error ? error.message : '登录失败'
      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function resumeProtectedNavigation(router: Router) {
    const target = redirectTarget.value
    redirectTarget.value = null

    if (target) {
      await router.push(target)
      return
    }

    await router.push({ name: 'profile' })
  }

  function logout() {
    authErrorMessage.value = ''
    currentSession.value = null
    redirectTarget.value = null
    isAuthModalOpen.value = false
    authMode.value = 'code'
  }

  return {
    authErrorMessage,
    authMode,
    closeAuthModal,
    completeLogin,
    currentSession,
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    isSendingCode,
    isSubmitting,
    loginWithCode,
    loginWithPassword,
    logout,
    openAuthModal,
    redirectTarget,
    resumeProtectedNavigation,
    sendVerificationCode,
    switchAuthMode,
  }
})
