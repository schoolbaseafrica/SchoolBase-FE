"use client"

import { Class, Subject, Term } from "@/types/result"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterSectionProps {
  classes: Class[]
  subjects: Subject[]
  terms: Term[]
  selectedClass: string
  selectedSubject: string
  selectedTerm: string
  onClassChange: (classId: string) => void
  onSubjectChange: (subjectId: string) => void
  onTermChange: (termId: string) => void
}

export function FilterSection({
  classes,
  subjects,
  terms,
  selectedClass,
  selectedSubject,
  selectedTerm,
  onClassChange,
  onSubjectChange,
  onTermChange,
}: FilterSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
      {/* Class Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Class</label>
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Term Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Term</label>
        <Select value={selectedTerm} onValueChange={onTermChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
