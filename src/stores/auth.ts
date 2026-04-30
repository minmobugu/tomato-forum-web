import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocationRaw, Router } from 'vue-router'

import { authService } from '../services/auth'
import type {
  AuthMode,
  AuthSession,
  LoginWithCodePayload,
  LoginWithPasswordPayload,
  SmsCodeSendResult,
} from '../types/auth'
import { readStoredAuthSession, writeStoredAuthSession } from '../utils/authSession'

export const useAuthStore = defineStore('auth', () => {
  const currentSession = ref<AuthSession | null>(null)
  const isAuthModalOpen = ref(false)
  const authMode = ref<AuthMode>('code')
  const isSendingCode = ref(false)
  const isSubmitting = ref(false)
  const authErrorMessage = ref('')
  const redirectTarget = ref<RouteLocationRaw | null>(null)
  const lastSmsCodeResult = ref<SmsCodeSendResult | null>(null)

  const isAuthenticated = computed(() => Boolean(currentSession.value?.token.accessToken))
  const currentUser = computed(() => currentSession.value?.user ?? null)

  function persistCurrentSession() {
    writeStoredAuthSession(currentSession.value)
  }

  function restoreSession() {
    currentSession.value = readStoredAuthSession()
  }

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
      lastSmsCodeResult.value = await authService.sendCode(phone)
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
    persistCurrentSession()
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

  async function logout() {
    authErrorMessage.value = ''

    try {
      await authService.logout()
    }
    catch (error) {
      authErrorMessage.value = error instanceof Error ? error.message : '退出登录失败'
      throw error
    }
    finally {
      currentSession.value = null
      redirectTarget.value = null
      isAuthModalOpen.value = false
      authMode.value = 'code'
      lastSmsCodeResult.value = null
      persistCurrentSession()
    }
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
    lastSmsCodeResult,
    logout,
    openAuthModal,
    redirectTarget,
    restoreSession,
    resumeProtectedNavigation,
    sendVerificationCode,
    switchAuthMode,
  }
})
