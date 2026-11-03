"use client"

import { useState } from "react"
import { UsersView } from "@/components/users/users-view"
import { useGetParents } from "./_hooks/use-parents"
import {
  useParentsStore,
  selectFilteredParents,
  selectPaginatedParents,
} from "@/store/parents-store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import BulkParentUploadDialog from "./_components/bulk-parent-upload-dialog"

export default function ParentsPage() {
  const [showBulkParentUploadDialog, setShowBulkParentUploadDialog] = useState(false)
  const { isLoading: isQueryLoading, isError, error } = useGetParents()

  const { parents, parentIds, filters } = useParentsStore(
    useShallow((state) => ({
      parents: state.parents,
      parentIds: state.parentIds,
      filters: state.filters,
    }))
  )

  const setFilters = useParentsStore((state) => state.setFilters)

  const filteredAll = useMemo(
    () => selectFilteredParents(parents, parentIds, filters),
    [parents, parentIds, filters]
  )

  const paginatedParents = useMemo(
    () => selectPaginatedParents(filteredAll, filters.page, filters.limit),
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
      <UsersView
        isLoading={isQueryLoading && parentIds.length === 0}
        isError={isError}
        error={error?.message}
        users={paginatedParents}
        userType="parents"
        searchQuery={filters.search}
        statusFilter={currentStatusFilter}
        currentPage={filters.page}
        totalPages={totalPages}
        pageSize={filters.limit}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onPageChange={handlePageChange}
        headerActions={
          <Button
            onClick={() => setShowBulkParentUploadDialog(true)}
            variant="default"
            size="lg"
            className="w-full whitespace-nowrap sm:w-auto"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Upload Parents (CSV)
          </Button>
        }
      />

      <BulkParentUploadDialog
        open={showBulkParentUploadDialog}
        setOpen={setShowBulkParentUploadDialog}
        onSuccess={() => {}}
      />
    </>
  )
}
