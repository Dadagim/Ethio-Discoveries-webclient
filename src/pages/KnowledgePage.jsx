import {
  BookMarked,
  ExternalLink,
  FolderPlus,
  Folder as FolderIcon,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  createEntry,
  createFolder,
  deleteEntry,
  deleteFolder,
  listEntries,
  listFolders,
  updateEntry,
  updateFolder,
} from "@/api/knowledge"
import { PageHeader } from "@/components/layout/PageHeader"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { getApiError, getFieldErrors } from "@/lib/errors"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const EMPTY_FOLDER_FORM = { name: "", description: "" }

function emptyEntryForm(folderId) {
  return {
    folder: folderId ? String(folderId) : "",
    title: "",
    content: "",
    source_url: "",
  }
}

function FolderRow({ folder, active, onSelect, onEdit, onDelete }) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        active
          ? "border-brand-teal/40 bg-brand-mist/60"
          : "border-transparent hover:border-border hover:bg-background/70"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <FolderIcon
          className={cn("size-4 shrink-0", active ? "text-brand-teal" : "text-muted-foreground")}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {folder.name}
          </span>
          {folder.description && (
            <span className="block truncate text-xs text-muted-foreground">
              {folder.description}
            </span>
          )}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {folder.entry_count}
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Rename ${folder.name}`}
          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${folder.name}`}
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function KnowledgePage() {
  const [folders, setFolders] = useState([])
  const [entries, setEntries] = useState([])
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const [folderForm, setFolderForm] = useState(EMPTY_FOLDER_FORM)
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [folderSaving, setFolderSaving] = useState(false)
  const [folderErrors, setFolderErrors] = useState({})

  const [entryForm, setEntryForm] = useState(emptyEntryForm())
  const [entryFormOpen, setEntryFormOpen] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [entrySaving, setEntrySaving] = useState(false)
  const [entryErrors, setEntryErrors] = useState({})

  const activeFolder = useMemo(
    () => folders.find((folder) => String(folder.id) === String(selectedFolder)) ?? null,
    [folders, selectedFolder]
  )

  const loadFolders = useCallback(async () => {
    const data = await listFolders()
    setFolders(data.results ?? [])
    return data.results ?? []
  }, [])

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true)
    try {
      const data = await listEntries({
        folder: selectedFolder === "all" ? undefined : selectedFolder,
        search: search || undefined,
      })
      setEntries(data.results ?? [])
    } finally {
      setEntriesLoading(false)
    }
  }, [selectedFolder, search])

  useEffect(() => {
    let active = true
    setLoading(true)
    loadFolders()
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, "Your knowledge space could not be loaded."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadFolders])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEntries().catch((requestError) => {
        setError(getApiError(requestError, "Your notes could not be loaded."))
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [loadEntries])

  const openNewFolder = () => {
    setFolderForm(EMPTY_FOLDER_FORM)
    setEditingFolderId(null)
    setFolderErrors({})
    setFolderFormOpen(true)
  }

  const openEditFolder = (folder) => {
    setFolderForm({ name: folder.name, description: folder.description })
    setEditingFolderId(folder.id)
    setFolderErrors({})
    setFolderFormOpen(true)
  }

  const handleFolderSubmit = async (event) => {
    event.preventDefault()
    setFolderSaving(true)
    setError("")
    setFolderErrors({})
    try {
      if (editingFolderId) {
        await updateFolder(editingFolderId, folderForm)
        setNotice("Folder updated.")
      } else {
        await createFolder(folderForm)
        setNotice("Folder created.")
      }
      setFolderFormOpen(false)
      setFolderForm(EMPTY_FOLDER_FORM)
      setEditingFolderId(null)
      await loadFolders()
    } catch (requestError) {
      setFolderErrors(getFieldErrors(requestError))
      setError(getApiError(requestError, "The folder could not be saved."))
    } finally {
      setFolderSaving(false)
    }
  }

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Delete the folder “${folder.name}”?`)) return
    setError("")
    setNotice("")
    try {
      await deleteFolder(folder.id)
      if (String(selectedFolder) === String(folder.id)) setSelectedFolder("all")
      setNotice("Folder deleted.")
      await loadFolders()
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "The folder could not be deleted. Move or delete its notes first."
        )
      )
    }
  }

  const openNewEntry = () => {
    const folderId = selectedFolder === "all" ? folders[0]?.id : selectedFolder
    setEntryForm(emptyEntryForm(folderId))
    setEditingEntryId(null)
    setEntryErrors({})
    setEntryFormOpen(true)
    setNotice("")
  }

  const openEditEntry = (entry) => {
    setEntryForm({
      folder: String(entry.folder),
      title: entry.title,
      content: entry.content,
      source_url: entry.source_url || "",
    })
    setEditingEntryId(entry.id)
    setEntryErrors({})
    setEntryFormOpen(true)
    setNotice("")
  }

  const closeEntryForm = () => {
    setEntryFormOpen(false)
    setEditingEntryId(null)
    setEntryForm(emptyEntryForm())
    setEntryErrors({})
  }

  const handleEntrySubmit = async (event) => {
    event.preventDefault()
    setEntrySaving(true)
    setError("")
    setEntryErrors({})
    try {
      const payload = {
        folder: Number(entryForm.folder),
        title: entryForm.title.trim(),
        content: entryForm.content.trim(),
        source_url: entryForm.source_url.trim(),
      }
      if (editingEntryId) {
        await updateEntry(editingEntryId, payload)
        setNotice("Note updated.")
      } else {
        await createEntry(payload)
        setNotice("Note saved to your knowledge space.")
      }
      closeEntryForm()
      await Promise.all([loadFolders(), loadEntries()])
    } catch (requestError) {
      setEntryErrors(getFieldErrors(requestError))
      setError(getApiError(requestError, "The note could not be saved."))
    } finally {
      setEntrySaving(false)
    }
  }

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm(`Delete “${entry.title}”?`)) return
    setError("")
    setNotice("")
    try {
      await deleteEntry(entry.id)
      setNotice("Note deleted.")
      await Promise.all([loadFolders(), loadEntries()])
    } catch (requestError) {
      setError(getApiError(requestError, "The note could not be deleted."))
    }
  }

  const totalEntries = folders.reduce((sum, folder) => sum + folder.entry_count, 0)

  return (
    <>
      <PageHeader
        eyebrow="My Knowledge"
        title="Your private learning space"
        description="Collect what you are learning, organize it into folders, and keep the sources that matter. Only you can see this."
        actions={
          <Button
            size="lg"
            className="h-10 px-4"
            onClick={openNewEntry}
            disabled={folders.length === 0}
          >
            <Plus className="size-4" />
            New note
          </Button>
        }
      />

      {error && (
        <div className="mb-5">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {notice && (
        <div className="mb-5">
          <Alert variant="success">{notice}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Folders</h2>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={openNewFolder}>
                <FolderPlus className="size-4" />
                New
              </Button>
            </div>

            {folderFormOpen && (
              <form
                onSubmit={handleFolderSubmit}
                className="mt-3 space-y-2.5 rounded-xl border border-brand-teal/25 bg-brand-mist/30 p-3"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="folder-name" className="text-xs">
                    Folder name
                  </Label>
                  <Input
                    id="folder-name"
                    value={folderForm.name}
                    onChange={(event) =>
                      setFolderForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="e.g. Energy notes"
                    maxLength={120}
                    required
                    aria-invalid={Boolean(folderErrors.name)}
                  />
                  {folderErrors.name && (
                    <p className="text-xs text-destructive">{folderErrors.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="folder-description" className="text-xs">
                    Description (optional)
                  </Label>
                  <Input
                    id="folder-description"
                    value={folderForm.description}
                    onChange={(event) =>
                      setFolderForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="What belongs here?"
                    maxLength={400}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Button type="submit" size="sm" disabled={folderSaving || !folderForm.name.trim()}>
                    {folderSaving ? <Spinner /> : null}
                    {editingFolderId ? "Save" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFolderFormOpen(false)
                      setEditingFolderId(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="mt-6 flex justify-center py-4">
                <Spinner className="size-5 text-brand-teal" />
              </div>
            ) : folders.length > 0 ? (
              <div className="mt-3 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedFolder("all")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                    selectedFolder === "all"
                      ? "bg-brand-mist/60 text-brand-navy"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )}
                >
                  <Layers className="size-4" />
                  All notes
                  <span className="ml-auto text-xs tabular-nums">{totalEntries}</span>
                </button>
                {folders.map((folder) => (
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    active={String(selectedFolder) === String(folder.id)}
                    onSelect={() => setSelectedFolder(String(folder.id))}
                    onEdit={() => openEditFolder(folder)}
                    onDelete={() => handleDeleteFolder(folder)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-center">
                <FolderIcon className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Create a folder to start organizing your notes.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-brand-teal/20 bg-brand-mist/50 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
              <BookMarked className="size-4" />
              Private by design
            </p>
            <p className="mt-2 text-xs leading-relaxed text-brand-navy/70">
              Knowledge entries are visible only to you. They are your working memory, not public
              posts—share an idea with a community when it is ready.
            </p>
          </div>
        </aside>

        <section className="space-y-4">
          {entryFormOpen && (
            <form
              onSubmit={handleEntrySubmit}
              className="rounded-2xl border border-brand-teal/25 bg-card p-5 shadow-xs sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {editingEntryId ? "Edit note" : "New note"}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Write for your future self: context, insight, and a source.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEntryForm}
                  aria-label="Close note form"
                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="entry-folder">Folder</Label>
                <select
                  id="entry-folder"
                  value={entryForm.folder}
                  onChange={(event) =>
                    setEntryForm((current) => ({ ...current, folder: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                  required
                  aria-invalid={Boolean(entryErrors.folder)}
                >
                  <option value="">Choose a folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                {entryErrors.folder && (
                  <p className="text-xs text-destructive">{entryErrors.folder}</p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="entry-title">Title</Label>
                <Input
                  id="entry-title"
                  value={entryForm.title}
                  onChange={(event) =>
                    setEntryForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="What is the insight or topic?"
                  maxLength={200}
                  required
                  aria-invalid={Boolean(entryErrors.title)}
                />
                {entryErrors.title && (
                  <p className="text-xs text-destructive">{entryErrors.title}</p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="entry-content">Note</Label>
                <Textarea
                  id="entry-content"
                  rows={6}
                  value={entryForm.content}
                  onChange={(event) =>
                    setEntryForm((current) => ({ ...current, content: event.target.value }))
                  }
                  placeholder="Capture the idea, the method, the result, or the question you still need to answer."
                  maxLength={8000}
                  required
                  aria-invalid={Boolean(entryErrors.content)}
                />
                {entryErrors.content && (
                  <p className="text-xs text-destructive">{entryErrors.content}</p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="entry-source">Source link (optional)</Label>
                <Input
                  id="entry-source"
                  type="url"
                  value={entryForm.source_url}
                  onChange={(event) =>
                    setEntryForm((current) => ({ ...current, source_url: event.target.value }))
                  }
                  placeholder="https://…"
                  maxLength={500}
                  aria-invalid={Boolean(entryErrors.source_url)}
                />
                {entryErrors.source_url && (
                  <p className="text-xs text-destructive">{entryErrors.source_url}</p>
                )}
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" size="lg" onClick={closeEntryForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={entrySaving || !entryForm.title.trim() || !entryForm.content.trim()}
                >
                  {entrySaving ? <Spinner /> : null}
                  {entrySaving ? "Saving…" : editingEntryId ? "Save changes" : "Save note"}
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {selectedFolder === "all" ? "All notes" : activeFolder?.name || "Folder"}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entries.length} {entries.length === 1 ? "note" : "notes"}
                  {activeFolder?.description ? ` · ${activeFolder.description}` : ""}
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your notes"
                  className="h-10 pl-9"
                  aria-label="Search knowledge entries"
                />
              </div>
            </div>
          </div>

          {entriesLoading ? (
            <div className="flex flex-col items-center gap-3 py-14 text-muted-foreground">
              <Spinner className="size-6 text-brand-teal" />
              <p className="text-sm">Loading notes…</p>
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge variant="outline" className="mb-2 gap-1">
                        <FolderIcon className="size-3" />
                        {entry.folder_name}
                      </Badge>
                      <h3 className="text-base font-semibold leading-snug text-foreground">
                        {entry.title}
                      </h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditEntry(entry)}
                        aria-label={`Edit ${entry.title}`}
                        className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry)}
                        aria-label={`Delete ${entry.title}`}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {entry.content}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>Added {formatDate(entry.created_at)}</span>
                    {entry.source_url && (
                      <a
                        href={entry.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 font-medium text-brand-navy hover:text-brand-teal"
                      >
                        <ExternalLink className="size-3" />
                        Source
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
                <BookMarked className="size-6" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                {folders.length === 0
                  ? "Start with a folder."
                  : search
                    ? "No notes match your search."
                    : "No notes in this space yet."}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {folders.length === 0
                  ? "Create a folder for a subject you are learning, then save your first note."
                  : search
                    ? "Try a different term, or save a new note for this topic."
                    : "Save a reading note, a method, or an idea you want to return to."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {folders.length === 0 ? (
                  <Button size="lg" onClick={openNewFolder}>
                    <FolderPlus className="size-4" />
                    Create a folder
                  </Button>
                ) : (
                  <Button size="lg" onClick={openNewEntry}>
                    <Plus className="size-4" />
                    New note
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
