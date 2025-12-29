"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetStudents } from "./_hooks/use-students"
import {
  useStudentsStore,
  selectFilteredStudents,
  selectPaginatedStudents,
} from "@/store/students-store"
import { useShallow } from "zustand/react/shallow"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import BulkAssignClassDialog from "./_components/bulk-assign-class-dialog"
import BulkNfcImportDialog from "./_components/bulk-nfc-import-dialog"
import BulkNfcExportButton from "./_components/bulk-nfc-export-button"

export default function StudentsPage() {
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false)
  const [showBulkNfcImportDialog, setShowBulkNfcImportDialog] = useState(false)
  const { isLoading: isQueryLoading, isError, error } = useGetStudents()

  const { students, studentIds, filters } = useStudentsStore(
    useShallow((state) => ({
      students: state.students,
      studentIds: state.studentIds,
      filters: state.filters,
    }))
  )
  const setFilters = useStudentsStore((state) => state.setFilters)

  const filteredAll = useMemo(
    () => selectFilteredStudents(students, studentIds, filters),
    [students, studentIds, filters]
  )

  const paginatedStudents = useMemo(
    () => selectPaginatedStudents(filteredAll, filters.page, filters.limit),
    [filteredAll, filters.page, filters.limit]
  )

  const totalPages = Math.ceil(filteredAll.length / filters.limit)

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search, page: 1 })
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters({
      isActive: status === "active" ? true : status === "inactive" ? false : undefined,
      page: 1,
    })
  }

  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <>
      <div className="mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <BulkNfcExportButton />
          <Button
            onClick={() => setShowBulkNfcImportDialog(true)}
            variant="outline"
            className="w-full rounded-xl font-medium sm:w-auto"
          >
            Import NFC Cards (CSV)
          </Button>
          <Button
            onClick={() => setShowBulkAssignDialog(true)}
            variant="default"
            className="w-full rounded-xl font-medium sm:w-auto"
          >
            <Users className="mr-2 h-5 w-5" />
            Assign Students to Class
          </Button>
        </div>

        <UsersView
          isLoading={isQueryLoading && studentIds.length === 0}
          isError={isError}
          error={error?.message}
          users={paginatedStudents}
          userType="students"
          searchQuery={filters.search}
          statusFilter={currentStatusFilter}
          currentPage={filters.page}
          totalPages={totalPages}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Bulk Assign Dialog */}
      <BulkAssignClassDialog
        open={showBulkAssignDialog}
        setOpen={setShowBulkAssignDialog}
        onSuccess={() => {
          // Optionally refresh the students list
        }}
      />

      {/* Bulk NFC Import Dialog */}
      <BulkNfcImportDialog
        open={showBulkNfcImportDialog}
        setOpen={setShowBulkNfcImportDialog}
        onSuccess={() => {
          // Optionally refresh the students list
        }}
      />
    </>
  )
}
