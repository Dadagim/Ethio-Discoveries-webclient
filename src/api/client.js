import axios from "axios"

/**
 * All requests go through the Vite proxy in development, so the browser sees
 * one origin. That keeps the Django session cookie and CSRF flow simple.
 */
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    Accept: "application/json",
  },
})

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"])

api.interceptors.request.use(async (config) => {
  if (!UNSAFE_METHODS.has(config.method?.toLowerCase())) {
    return config
  }

  const { data } = await api.get("/auth/csrf/")
  if (!data?.csrfToken) {
    throw new Error("The server did not provide a CSRF token.")
  }

  config.headers["X-CSRFToken"] = data.csrfToken
  return config
})

export default api
