import { Play } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Click-to-load external video.
 *
 * The iframe is rendered only after the reader presses play, so feeds never
 * contact YouTube or download player code for videos nobody watches. Playback
 * uses the privacy-enhanced youtube-nocookie.com embed URL built by the API.
 */
export default function ExternalVideoPlayer({ media, className }) {
  const [active, setActive] = useState(false)

  if (!media?.embed_url) return null

  const title = media.title || "Video attached to this contribution"

  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-black", className)}>
      {active ? (
        <div className="aspect-video w-full">
          <iframe
            src={media.embed_url}
            title={title}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group relative block aspect-video w-full text-left"
          aria-label={`Play video: ${title}`}
        >
          {media.thumbnail_url ? (
            <img
              src={media.thumbnail_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="block h-full w-full bg-brand-navy" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition-transform group-hover:scale-105">
              <Play className="size-6 fill-current" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-sm font-medium text-white">
            {title}
          </span>
        </button>
      )}

      <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-card px-3 py-2 text-xs text-muted-foreground">
        <span>Loads only when you press play.</span>
        {media.canonical_url && (
          <a
            href={media.canonical_url}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-navy transition-colors hover:text-brand-teal"
          >
            Watch on YouTube
          </a>
        )}
      </figcaption>
    </figure>
  )
}
