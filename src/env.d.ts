/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_COMMUNITY_DATA_SOURCE?: 'mock' | 'api'
  readonly VITE_IM_DATA_SOURCE?: 'mock' | 'api'
  readonly VITE_IM_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
