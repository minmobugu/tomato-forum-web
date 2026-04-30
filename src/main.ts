import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { pinia } from './stores/pinia'
import './assets/styles/main.scss'

const app = createApp(App)

app.use(pinia)

useAuthStore(pinia).restoreSession()

app.use(router)

app.mount('#app')
