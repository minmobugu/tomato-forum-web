<script setup lang="ts">
import { reactive, watch } from 'vue'

import type { AuthMode } from '../../types/auth'

const props = defineProps<{
  open: boolean
  mode: AuthMode
  isSendingCode: boolean
  isSubmitting: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  'switch-mode': [mode: AuthMode]
  'send-code': [phone: string]
  'submit-code-login': [payload: { phone: string; code: string }]
  'submit-password-login': [payload: { phone: string; password: string }]
}>()

const codeForm = reactive({
  phone: '',
  code: '',
})

const passwordForm = reactive({
  phone: '',
  password: '',
})

watch(
  () => props.open,
  (open) => {
    if (!open) return

    codeForm.phone = ''
    codeForm.code = ''
    passwordForm.phone = ''
    passwordForm.password = ''
  },
)

function submitCodeLogin() {
  emit('submit-code-login', {
    phone: codeForm.phone,
    code: codeForm.code,
  })
}

function submitPasswordLogin() {
  emit('submit-password-login', {
    phone: passwordForm.phone,
    password: passwordForm.password,
  })
}
</script>

<template>
  <section class="auth-modal topbar-panel panel-card panel-card--soft" aria-modal="true" role="dialog">
    <div class="auth-modal__header topbar-panel__header">
      <div>
        <small>账号入口</small>
        <h3>登录 / 注册</h3>
      </div>
      <button class="auth-modal__close ghost-button" type="button" @click="emit('close')">关闭</button>
    </div>

    <p class="auth-modal__tip">首次登录将自动注册，无需单独创建账号。</p>

    <div class="auth-modal__tabs">
      <button
        class="auth-modal__tab"
        :class="{ 'auth-modal__tab--active': mode === 'code' }"
        type="button"
        @click="emit('switch-mode', 'code')"
      >
        手机验证码登录
      </button>
      <button
        class="auth-modal__tab"
        :class="{ 'auth-modal__tab--active': mode === 'password' }"
        type="button"
        @click="emit('switch-mode', 'password')"
      >
        手机号 + 密码登录
      </button>
    </div>

    <p v-if="errorMessage" class="auth-modal__error">{{ errorMessage }}</p>

    <div v-if="mode === 'code'" class="auth-modal__body">
      <label class="topbar-field">
        <span>手机号</span>
        <input v-model="codeForm.phone" type="tel" placeholder="请输入手机号" />
      </label>

      <label class="topbar-field">
        <span>验证码</span>
        <div class="auth-modal__code-row">
          <input v-model="codeForm.code" type="text" placeholder="输入验证码" />
          <button class="ghost-button" type="button" :disabled="isSendingCode" @click="emit('send-code', codeForm.phone)">
            {{ isSendingCode ? '发送中...' : '发送验证码' }}
          </button>
        </div>
      </label>

      <div class="auth-modal__actions">
        <button class="primary-button" type="button" :disabled="isSubmitting" @click="submitCodeLogin">
          {{ isSubmitting ? '登录中...' : '立即登录' }}
        </button>
      </div>
    </div>

    <div v-else class="auth-modal__body">
      <label class="topbar-field">
        <span>手机号</span>
        <input v-model="passwordForm.phone" type="tel" placeholder="请输入手机号" />
      </label>

      <label class="topbar-field">
        <span>密码</span>
        <input v-model="passwordForm.password" type="password" placeholder="请输入密码" />
      </label>

      <div class="auth-modal__actions">
        <button class="primary-button" type="button" :disabled="isSubmitting" @click="submitPasswordLogin">
          {{ isSubmitting ? '登录中...' : '立即登录' }}
        </button>
      </div>
    </div>
  </section>
</template>
