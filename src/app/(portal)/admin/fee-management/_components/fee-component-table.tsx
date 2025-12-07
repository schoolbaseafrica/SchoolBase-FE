"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useDeactivateFee, useAactivateFee } from "../_hooks/use-fees"
import type { FeeComponent } from "@/lib/fees-management"

interface FeeComponentTableProps {
  feeComponents: FeeComponent[]
}

type ActionType = "activate" | "deactivate" | null

const FeeComponentTable: React.FC<FeeComponentTableProps> = ({ feeComponents }) => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedFee, setSelectedFee] = useState<FeeComponent | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)

  const deactivateMutation = useDeactivateFee(selectedFee?.id || "")
  const activateMutation = useAactivateFee(selectedFee?.id || "")

  const handleViewClick = (fee: FeeComponent) => {
    setSelectedFee(fee)
    setOpenDrawer(true)
  }

  const openConfirmDialog = (action: ActionType) => {
    setActionType(action)
  }

  const closeConfirmDialog = () => {
    setActionType(null)
  }

  const handleDeactivate = () => {
    if (!selectedFee) return

    deactivateMutation.mutate("No longer applicable for current academic year", {
      onSuccess: () => {
        toast.success("Fee component deactivated successfully")
        closeConfirmDialog()
        setOpenDrawer(false)
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to deactivate fee component"
        )
      },
    })
  }

  const handleActivate = () => {
    if (!selectedFee) return

    activateMutation.mutate("Reactivated for current academic year", {
      onSuccess: () => {
        toast.success("Fee component activated successfully")
        closeConfirmDialog()
        setOpenDrawer(false)
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to activate fee component"
        )
      },
    })
  }

  const isActive = selectedFee?.status.toUpperCase() === "ACTIVE"
  const isPending = deactivateMutation.isPending || activateMutation.isPending

  return (
    <>
      <div className="border-primary/30 hidden rounded-xl border p-6 lg:block">
        <div className="rounded-sm border">
          <Table className="border-[#EAECF0]">
            <TableHeader className="h-13 bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="px-4 py-2.5">Fee Name</TableHead>
                <TableHead className="px-4 py-2.5">Description</TableHead>
                <TableHead className="px-4 py-2.5 text-center">Term</TableHead>
                <TableHead className="px-4 py-2.5 text-center">Created By</TableHead>
                <TableHead className="px-4 py-2.5 text-center">Amount</TableHead>
                <TableHead className="px-4 py-2.5 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {feeComponents.map((fee) => (
                <TableRow
                  key={fee.id}
                  onClick={() => handleViewClick(fee)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-2.5 font-medium">
                    {fee.component_name}
                  </TableCell>
                  <TableCell className="w-30 max-w-30 truncate px-4 py-2.5">
                    {fee.description || "NIL"}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center">
                    {fee.term?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center">
                    {fee.createdBy?.first_name || "N/A"} {fee.createdBy?.last_name || ""}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center">
                    ₦ {fee.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        fee.status.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {fee.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Drawer */}
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} direction="right">
        <DrawerContent className="w-96">
          <DrawerHeader>
            <DrawerTitle>Fee Details</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            {selectedFee ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Fee Name</span>
                  <p className="mt-1 text-gray-900">{selectedFee.component_name}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Description</span>
                  <p className="mt-1 text-gray-900">{selectedFee.description || "NIL"}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Term</span>
                  <p className="mt-1 text-gray-900">{selectedFee.term?.name || "N/A"}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Created By</span>
                  <p className="mt-1 text-gray-900">
                    {selectedFee.createdBy?.first_name}{" "}
                    {selectedFee.createdBy?.last_name || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Amount</span>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₦{selectedFee.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Status</span>
                  <p className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        selectedFee.status.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedFee.status}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No details available.</p>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 border-t p-4">
            <Button size="lg" variant="outline" onClick={() => setOpenDrawer(false)}>
              Close
            </Button>

            {isActive ? (
              <Button
                size="lg"
                // variant="destructive"
                onClick={() => openConfirmDialog("deactivate")}
                disabled={isPending}
              >
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => openConfirmDialog("activate")}
                disabled={isPending}
              >
                {activateMutation.isPending ? "Activating..." : "Activate"}
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Single Confirmation Dialog */}
      <AlertDialog open={actionType !== null} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "activate" ? "Activate" : "Deactivate"} Fee?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "activate"
                ? "Are you sure you want to reactivate this fee? It will be available for use again."
                : "Are you sure you want to deactivate this fee? It will no longer be available for use."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={actionType === "activate" ? handleActivate : handleDeactivate}
              disabled={isPending}
              className={actionType === "deactivate" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isPending
                ? actionType === "activate"
                  ? "Activating..."
                  : "Deactivating..."
                : actionType === "activate"
                  ? "Yes, Activate"
                  : "Yes, Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default FeeComponentTable
