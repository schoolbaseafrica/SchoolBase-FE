"use client"

import { Class, Subject } from "@/types/result"
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
  selectedClass: string
  selectedSubject: string
  onClassChange: (classId: string) => void
  onSubjectChange: (subjectId: string) => void
  isSubjectDisabled?: boolean
}

export function FilterSection({
  classes,
  subjects,
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
  isSubjectDisabled = false,
}: FilterSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Class Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Class *</label>
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
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Subject *
          {!selectedClass && (
            <span className="ml-1 text-xs text-yellow-600">(Select class first)</span>
          )}
        </label>
        <Select
          value={selectedSubject}
          onValueChange={onSubjectChange}
          disabled={!selectedClass || isSubjectDisabled}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={selectedClass ? "Select subject" : "Select class first"}
            />
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
    </div>
  )
}
