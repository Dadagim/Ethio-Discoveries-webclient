import api from "@/api/client"

export async function listCommunities(params = {}) {
  const { data } = await api.get("/communities/", { params })
  return data
}

export async function getCommunity(slug) {
  const { data } = await api.get(`/communities/${slug}/`)
  return data
}

export async function createCommunity(payload) {
  const { data } = await api.post("/communities/", payload)
  return data
}

export async function joinCommunity(slug) {
  const { data } = await api.post(`/communities/${slug}/join/`)
  return data
}

export async function leaveCommunity(slug) {
  await api.post(`/communities/${slug}/leave/`)
}

export async function listMembers(slug, status) {
  const params = status ? { status } : undefined
  const { data } = await api.get(`/communities/${slug}/members/`, { params })
  return data
}

export async function reviewMembership(slug, membershipId, action) {
  const { data } = await api.post(
    `/communities/${slug}/members/${membershipId}/${action}/`
  )
  return data
}
