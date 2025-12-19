export function generatePaletteFromPrimary(primary: string) {
  // naive derivations for now; can be replaced with more robust color utils
  const lighten = (hex: string, amount: number) => {
    const num = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, "0")}`
  }

  return {
    primary,
    primaryHover: lighten(primary, -15),
    tint: lighten(primary, 60),
    onPrimary: "#ffffff",
    text: "#1f2024",
    mutedText: "#4a4a4a",
    surface: "#fffaf8",
  }
}
