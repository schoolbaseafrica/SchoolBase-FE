import type { ComponentType } from "react"
import {
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  FlaskConical,
  GraduationCap,
  Music,
  Palette,
  PenTool,
  School,
  Sparkles,
  Users,
} from "lucide-react"

export type LandingIconOption = {
  value: string
  label: string
  Icon: ComponentType<{ className?: string }>
}

export const LANDING_ICON_OPTIONS: LandingIconOption[] = [
  { value: "book", label: "Book", Icon: BookOpen },
  { value: "graduation-cap", label: "Graduation Cap", Icon: GraduationCap },
  { value: "flask", label: "Flask", Icon: FlaskConical },
  { value: "building", label: "Building", Icon: Building2 },
  { value: "school", label: "School", Icon: School },
  { value: "pen-tool", label: "Pen Tool", Icon: PenTool },
  { value: "music", label: "Music", Icon: Music },
  { value: "palette", label: "Palette", Icon: Palette },
  { value: "calculator", label: "Calculator", Icon: Calculator },
  { value: "chart", label: "Chart", Icon: BarChart3 },
  { value: "users", label: "Users", Icon: Users },
  { value: "sparkles", label: "Sparkles", Icon: Sparkles },
]

const landingIconMap = new Map<string, LandingIconOption["Icon"]>(
  LANDING_ICON_OPTIONS.map((option) => [option.value, option.Icon])
)

landingIconMap.set("beaker", FlaskConical)

export const getLandingIcon = (value?: string) =>
  landingIconMap.get(value ?? "") ?? Sparkles
