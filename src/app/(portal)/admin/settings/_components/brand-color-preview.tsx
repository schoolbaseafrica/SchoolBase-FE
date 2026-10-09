import { readableTextOn } from "@/lib/brand-colors"

type BrandColorPreviewProps = {
  primary: string
  secondary: string
  accent: string
}

const validColor = (value: string, fallback: string) =>
  /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback

export function BrandColorPreview({
  primary,
  secondary,
  accent,
}: BrandColorPreviewProps) {
  const main = validColor(primary, "#c7363f")
  const supporting = validColor(secondary, main)
  const highlight = validColor(accent, main)

  return (
    <div className="rounded-[1.25rem] border border-[var(--portal-line)] bg-white p-5 shadow-sm">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
        Brand preview
      </p>
      <p className="text-muted-foreground mt-2 text-sm">
        Preview changes as you choose colors. Save school information to apply them across
        the portal.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--portal-line)] p-4">
          <p className="text-muted-foreground text-xs font-medium">Primary</p>
          <span
            className="mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: main, color: readableTextOn(main) }}
          >
            Main action
          </span>
          <p className="text-muted-foreground mt-3 text-xs">
            Buttons and active navigation
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--portal-line)] p-4">
          <p className="text-muted-foreground text-xs font-medium">Secondary</p>
          <span
            className="text-foreground mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold"
            style={{
              borderColor: `${supporting}66`,
              backgroundColor: `${supporting}1f`,
            }}
          >
            Supporting action
          </span>
          <p className="text-muted-foreground mt-3 text-xs">
            Supporting controls and section labels
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--portal-line)] p-4">
          <p className="text-muted-foreground text-xs font-medium">Accent</p>
          <span
            className="mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: highlight,
              color: readableTextOn(highlight),
            }}
          >
            Highlight
          </span>
          <p className="text-muted-foreground mt-3 text-xs">
            Icons, focus rings and highlights
          </p>
        </div>
      </div>
    </div>
  )
}
