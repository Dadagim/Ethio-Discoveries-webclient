export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data

  if (!data) return fallback
  if (typeof data === "string") return data
  if (typeof data.detail === "string") return data.detail
  if (typeof data.message === "string") return data.message

  if (typeof data === "object") {
    const firstValue = Object.values(data)[0]
    if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0])
    if (typeof firstValue === "string") return firstValue
  }

  return fallback
}

export function getFieldErrors(error) {
  const data = error?.response?.data
  if (!data || typeof data !== "object" || Array.isArray(data)) return {}

  return Object.fromEntries(
    Object.entries(data).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(" ") : String(messages),
    ])
  )
}
