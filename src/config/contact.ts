/**
 * Admin contact configuration.
 * Uses environment variable if set, otherwise falls back to the official contact email from Footer.
 */
export const ADMIN_CONTACT_EMAIL: string = (
  import.meta.env.VITE_ADMIN_CONTACT_EMAIL || 'huuthang.cv0612@gmail.com'
).trim()
