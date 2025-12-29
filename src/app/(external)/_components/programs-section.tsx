"use client"

import {
  BookOpen,
  FlaskConical,
  Palette,
  Sparkles,
  Users,
  GraduationCap,
} from "lucide-react"
import type { ComponentType } from "react"
import { useSchoolStore } from "@/store/use-school-store"

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  book: BookOpen,
  flask: FlaskConical,
  palette: Palette,
  sparkles: Sparkles,
  users: Users,
  music: GraduationCap,
}

export function ProgramsSection() {
  const programs = useSchoolStore((state) => state.school.programs)
  const schoolName = useSchoolStore((state) => state.school.shortName)

  return (
    <section id="programs" className="bg-gray-50 py-16">
      <div className="container space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Our Academic Program</h2>
          <p className="text-lg text-[var(--text-secondary)]">
            A complete learning path for {schoolName.toLowerCase()} students.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = iconMap[program.icon] ?? Sparkles
            return (
              <article
                key={program.title}
                className="group rounded-2xl border border-transparent bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="text-accent mb-4 inline-flex rounded-xl bg-[var(--tint)] p-3">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{program.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {program.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
