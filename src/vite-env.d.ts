/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ADMIN_CONTACT_EMAIL?: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}