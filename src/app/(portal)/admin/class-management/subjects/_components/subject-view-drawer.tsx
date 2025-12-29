"use client"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useGetSubject } from "../_hooks/use-subjects"
import { X } from "lucide-react"

export const SubjectViewDrawer = ({
  open,
  onOpenChange,
  subjectID,
  //   onAssign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectID: string | null
  onAssign: (subjectID: string) => void
}) => {
  const { data: subject, isLoading } = useGetSubject(subjectID ?? "")

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ml-auto h-full space-y-6 overflow-x-hidden overflow-y-auto p-6">
        <DrawerHeader className="flex flex-row items-center justify-between px-0">
          <div>
            <DrawerTitle className="text-xl font-semibold">
              Subject: {subject?.name ?? "Loading..."}
            </DrawerTitle>
            <DrawerDescription>View subject details</DrawerDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="text-text-secondary size-5" />
          </Button>
        </DrawerHeader>

        {isLoading && <p className="text-sm text-gray-500">Loading details...</p>}

        {!isLoading && subject && (
          <div className="space-y-6">
            {/* Classes */}
            <section>
              <h4 className="mb-3 font-semibold">Assigned Classes</h4>

              {subject.classes && subject.classes.length > 0 ? (
                <div className="space-y-3">
                  {subject.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="space-y-1 rounded-lg border bg-gray-50 p-4"
                    >
                      <p>
                        <span className="font-medium">Class:</span> {cls.name}
                        {cls.arm && cls.arm !== null && `(${cls.arm})`}
                      </p>
                      {/* <p>
                        <span className="font-medium">Stream:</span> {cls.stream}
                      </p> */}
                      <p>
                        <span className="font-medium">Session:</span>{" "}
                        {cls.academicSession?.name}
                      </p>
                      {/* <p className="text-sm text-gray-500">
                        Assigned on:{" "}
                        {new Date(cls.teacher_assignment_date).toLocaleDateString()}
                      </p> */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No classes assigned yet.</p>
              )}
            </section>

            {/* Assign Button */}
            {/* <Button onClick={() => onAssign(subject.id)} className="w-full">
              Assign to Classes
            </Button> */}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
