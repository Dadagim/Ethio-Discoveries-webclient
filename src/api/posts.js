import api from "@/api/client"

export async function listPosts(params = {}) {
  const { data } = await api.get("/posts/", { params })
  return data
}

export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}/`)
  return data
}

export async function createPost(payload) {
  const { data } = await api.post("/posts/", payload)
  return data
}

export async function updatePost(id, payload) {
  const { data } = await api.patch(`/posts/${id}/`, payload)
  return data
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}/`)
}

export async function listComments(postId) {
  const { data } = await api.get(`/posts/${postId}/comments/`)
  return data
}

export async function createComment(postId, payload) {
  const { data } = await api.post(`/posts/${postId}/comments/`, payload)
  return data
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}/`)
}

export async function reactToPost(postId, type) {
  const { data } = await api.post(`/posts/${postId}/react/`, { type })
  return data
}
