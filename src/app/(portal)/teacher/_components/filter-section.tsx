"use client"

import { Class, Subject, Term } from "@/types/result"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

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
  isSubjectDisabled?: boolean
  isTermDisabled?: boolean
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
  isSubjectDisabled = false,
  isTermDisabled = false,
}: FilterSectionProps) {
  const [showSubjectWarning, setShowSubjectWarning] = useState(false)
  const [showTermWarning, setShowTermWarning] = useState(false)

  // Show warnings when subject or term is selected before class
  useEffect(() => {
    if (selectedSubject && !selectedClass) {
      // setShowSubjectWarning(true)
      const timer = setTimeout(() => setShowSubjectWarning(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [selectedSubject, selectedClass])

  useEffect(() => {
    if (selectedTerm && !selectedClass) {
      // setShowTermWarning(true)
      const timer = setTimeout(() => setShowTermWarning(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [selectedTerm, selectedClass])

  const handleSubjectChange = (subjectId: string) => {
    if (!selectedClass) {
      setShowSubjectWarning(true)
      setTimeout(() => setShowSubjectWarning(false), 5000)
      // const timer = setTimeout(() => setShowSubjectWarning(false), 5000)
      return
    }
    onSubjectChange(subjectId)
  }

  const handleTermChange = (termId: string) => {
    if (!selectedClass) {
      setShowTermWarning(true)
      setTimeout(() => setShowTermWarning(false), 5000)
      // const timer = setTimeout(() => setShowTermWarning(false), 5000)
      return
    }
    onTermChange(termId)
  }

  return (
    <div className="space-y-4">
      {/* Warning messages */}
      {showSubjectWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span>Please select a class first before choosing a subject.</span>
        </div>
      )}

      {showTermWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span>Please select a class first before choosing a term.</span>
        </div>
      )}

      {/* Filters grid */}
      <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
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
            onValueChange={handleSubjectChange}
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

        {/* Term Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Term *
            {!selectedClass && (
              <span className="ml-1 text-xs text-yellow-600">(Select class first)</span>
            )}
          </label>
          <Select
            value={selectedTerm}
            onValueChange={handleTermChange}
            disabled={!selectedClass || isTermDisabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={selectedClass ? "Select term" : "Select class first"}
              />
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

      {/* Validation message */}
      {/* {selectedClass && (!selectedSubject || !selectedTerm) && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p>
            Please select both a <strong>Subject</strong> and <strong>Term</strong> to enter grades.
          </p>
        </div>
      )} */}
    </div>
  )
}
