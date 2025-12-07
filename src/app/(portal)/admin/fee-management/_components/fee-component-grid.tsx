"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
// type FeeComponent = {
//   id: string
//   component_name: string
//   description?: string
//   term?: { id: string; name: string }
//   created_by: string
//   amount: number
//   status: string
//   created_at: string
// }

interface FeeComponentGridProps {
  feeComponents: FeeComponent[]
}

type ActionType = "activate" | "deactivate" | null

const FeeComponentGrid: React.FC<FeeComponentGridProps> = ({ feeComponents }) => {
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
      {/* Mobile Cards */}
      <div className="flex flex-col gap-4 lg:hidden">
        {feeComponents.map((fee) => (
          <Card key={fee.id} className="overflow-hidden">
            <CardHeader className="mx-2 border-b py-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-primary font-semibold">{fee.component_name}</h3>
                  {fee.description && (
                    <p className="mt-1 text-sm text-gray-600">{fee.description}</p>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                    fee.status.toLowerCase() === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {fee.status}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3 py-4">
                <div className="flex flex-col gap-1">
                  <p className="text-center text-xs text-gray-500">Term</p>
                  <p className="mt-1 text-center font-medium text-gray-900">
                    {fee.term?.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-center text-xs text-gray-500">Created By</p>
                  <p className="text-primary mt-1 text-center font-medium">
                    {/* {fee.createdBy.first_name} {fee.createdBy.last_name || "N/A"} */}
                    {fee.createdBy?.first_name || "N/A"} {fee.createdBy?.last_name || ""}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-center text-xs text-gray-500">Amount</p>
                  <p className="text-primary mt-1 text-center font-medium">
                    ₦{fee.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="w-full">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewClick(fee)}
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drawer */}
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="w-96">
          <DrawerHeader>
            <DrawerTitle>Fee Details</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            {selectedFee ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-primary font-medium">Fee Name</span>
                  <p className="text-primary mt-1">{selectedFee.component_name}</p>
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

                <div>
                  <span className="font-medium text-gray-500">Created At</span>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedFee.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No details available.</p>
            )}
          </div>

          {/* Footer */}
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

export default FeeComponentGrid
