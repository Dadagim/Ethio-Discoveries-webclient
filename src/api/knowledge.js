import api from "@/api/client"

export async function listFolders() {
  const { data } = await api.get("/knowledge/folders/")
  return data
}

export async function createFolder(payload) {
  const { data } = await api.post("/knowledge/folders/", payload)
  return data
}

export async function updateFolder(id, payload) {
  const { data } = await api.patch(`/knowledge/folders/${id}/`, payload)
  return data
}

export async function deleteFolder(id) {
  await api.delete(`/knowledge/folders/${id}/`)
}

export async function listEntries(params = {}) {
  const { data } = await api.get("/knowledge/entries/", { params })
  return data
}

export async function createEntry(payload) {
  const { data } = await api.post("/knowledge/entries/", payload)
  return data
}

export async function updateEntry(id, payload) {
  const { data } = await api.patch(`/knowledge/entries/${id}/`, payload)
  return data
}

export async function deleteEntry(id) {
  await api.delete(`/knowledge/entries/${id}/`)
}
