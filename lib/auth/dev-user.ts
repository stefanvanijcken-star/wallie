export const devUser = {
  email: "developer@wallie.local",
  id: "00000000-0000-4000-8000-000000000001",
}

export function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV === "development"
}
