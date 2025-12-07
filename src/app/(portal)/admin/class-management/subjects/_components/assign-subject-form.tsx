// assign-subject-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import {
  Subject,
  useAssignSubjectToClasses,
  useUnAssignSubjectToClasses,
} from "../_hooks/use-subjects"

interface AssignSubjectFormProps {
  subject: Subject
  classes: {
    id: string
    name: string
  }[]
  onSuccess: () => void
}

export default function AssignSubjectForm({
  subject,
  classes,
  onSuccess,
}: AssignSubjectFormProps) {
  const initAssignedClasses = subject.classes?.map((cls) => cls.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(
    new Set(initAssignedClasses)
  )
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const assignMutation = useAssignSubjectToClasses(subject.id)
  const unAssignMutation = useUnAssignSubjectToClasses(subject.id)
  const isPending = assignMutation.isPending || unAssignMutation.isPending

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage)
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div>
      {/* Subject Name Display */}
      <div className="mb-4 rounded-lg bg-gray-100 p-4">
        <p className="font-medium text-gray-900">{subject.name}</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search Class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pr-4 pl-9"
        />
      </div>

      {/* Classes List */}
      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {paginatedClasses.length > 0 ? (
          paginatedClasses.map((classItem) => {
            const isSelected = selectedClasses.has(classItem.id)

            return (
              <label
                key={classItem.id}
                className={`flex items-center justify-between rounded-xl border bg-white p-4 transition-all ${
                  isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleClass(classItem.id)}
                    className={
                      isSelected
                        ? "accent-accent border-green-600 bg-green-600"
                        : "accent-accent"
                    }
                  />
                  <div>
                    <h5 className="text-base font-semibold text-gray-900">
                      {classItem.name}
                    </h5>
                  </div>
                </div>
              </label>
            )
          })
        ) : (
          <div className="py-12 text-center">
            <p className="text-text-secondary text-sm">No classes found</p>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={
                currentPage === page
                  ? "bg-[#DA3743] text-white hover:bg-[#DA3743]/90 hover:text-white"
                  : ""
              }
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSaveChanges}
        disabled={selectedClasses.size === 0 || isPending}
        className="w-full"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )

  function handleToggleClass(classId: string) {
    setSelectedClasses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(classId)) {
        newSet.delete(classId)
      } else {
        newSet.add(classId)
      }
      return newSet
    })
  }

  async function handleSaveChanges() {
    const allAssignedArms = Array.from(selectedClasses)
    // map through classes for each arm and collate a list of the arms ids
    const newlyAssignedArms = allAssignedArms.filter(
      (armId) => !initAssignedClasses.includes(armId)
    )
    const newlyUnassignedArms = initAssignedClasses.filter(
      (armId) => !allAssignedArms.includes(armId)
    )
    try {
      await Promise.all([
        assignMutation.mutateAsync(newlyAssignedArms),
        unAssignMutation.mutateAsync(newlyUnassignedArms),
      ])
      onSuccess()
    } catch (error) {
      console.error("Failed to assign subject:", error)
    }
  }
}
