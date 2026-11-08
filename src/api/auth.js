import api from "@/api/client"

export async function verifyEmail(token) {
  const { data } = await api.post("/auth/verify-email/", { token })
  return data
}

export async function resendVerificationEmail() {
  const { data } = await api.post("/auth/verify-email/resend/")
  return data
}
