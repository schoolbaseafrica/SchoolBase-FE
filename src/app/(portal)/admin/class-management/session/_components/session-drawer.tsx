"use client"

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { AcademicSession } from "@/lib/academic-session"
import { format } from "date-fns"
import { X, Pencil, Power } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActivateAcademicSession } from "../_hooks/use-session"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type Props = {
  open: boolean
  onClose: () => void
  session: AcademicSession | null
}

export default function SessionDrawer({ open, onClose, session }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const activateMutation = useActivateAcademicSession()

  if (!session) return null

  const formatDate = (date: string) => format(new Date(date), "dd-MM-yyyy")

  const goToEdit = () => {
    router.push(`/admin/class-management/session/create-session?id=${session.id}`)
  }

  const handleActivate = async () => {
    if (!session) return
    try {
      const result = await activateMutation.mutateAsync(session.id)
      console.log("Activate result:", result) // Debug log
      console.log("Session status in result:", result?.status) // Debug log
      
      toast.success(`Session "${session.name}" has been activated successfully.`)
      // Close drawer - optimistic update should have already updated the UI
      onClose()
    } catch (error) {
      console.error("Activate error:", error) // Debug log
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to activate session. Please try again."
      )
    }
  }

  const canActivate = session.status === "Inactive"

  return (
    <Drawer open={open} onClose={onClose} direction="right">
      <DrawerContent className="ml-auto flex h-full w-full max-w-lg flex-col border-l shadow-xl">
        {/* Header */}
        <DrawerHeader>
          <div className="flex items-center justify-between border-b py-0">
            <DrawerTitle className="text-primary text-base leading-none">
              Session Preview
            </DrawerTitle>

            <Button size="icon" variant="ghost" onClick={onClose}>
              <X />
            </Button>
          </div>
        </DrawerHeader>

        {/* Body */}
        <ScrollArea className="flex-1 p-5">
          <div className="space-y-4">
            {/* Session Name */}
            <div>
              <p className="text-lg font-medium text-[#3E3E3E]">
                {session.name} Academic Session
              </p>
            </div>

            {/* Status */}
            <div className="grid grid-cols-[45fr_55fr] gap-1">
              <p className="text-text-secondary text-sm">Status</p>
              <span
                className={`w-fit rounded-2xl px-2 py-0.5 text-xs font-medium ${
                  session.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : session.status === "Inactive"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {session.status}
              </span>
            </div>

            {/* Description */}
            {session.description && (
              <div className="grid grid-cols-[45fr_55fr] gap-1">
                <p className="text-text-secondary text-sm">Description</p>
                <p className="text-primary text-sm wrap-break-word">
                  {session.description}
                </p>
              </div>
            )}

            {/* Terms */}
            {session.terms && session.terms?.length > 0 && (
              <div>
                {session.terms.map((term) => (
                  <div
                    key={term.id}
                    className="grid grid-cols-[45fr_55fr] gap-1 space-y-4"
                  >
                    <p className="text-text-secondary text-sm">{term.name} Start Date</p>
                    <p className="text-primary text-sm">{formatDate(term.startDate)}</p>

                    <p className="text-text-secondary text-sm">{term.name} End Date</p>
                    <p className="text-primary text-sm">{formatDate(term.endDate)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer inside DrawerContent */}
        <DrawerFooter className="border-t bg-white">
          <div className="flex justify-end gap-2">
            {canActivate && (
              <Button
                size="lg"
                variant="default"
                onClick={handleActivate}
                disabled={activateMutation.isPending}
                className=""
              >
                {activateMutation.isPending ? (
                  <>Activating...</>
                ) : (
                  <>
                    <Power className="mr-1 h-4 w-4" /> Activate Session
                  </>
                )}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              disabled={session.status === "Archived"}
              onClick={goToEdit}
              className=""
            >
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// "use client"

// import {
//   Drawer,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
// } from "@/components/ui/drawer"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Button } from "@/components/ui/button"
// import { AcademicSession } from "@/lib/academic-session"
// import { format } from "date-fns"
// import { X, Pencil } from "lucide-react"
// import { useRouter } from "next/navigation"

// type Props = {
//   open: boolean
//   onClose: () => void
//   session: AcademicSession | null
// }

// export default function SessionDrawer({ open, onClose, session }: Props) {
//   const router = useRouter()

//   if (!session) return null

//   const formatDate = (date: string) => format(new Date(date), "dd-MM-yyyy")

//   const goToEdit = () => {
//     router.push(`/admin/class-management/session/create-session?id=${session.id}`)
//   }

//   return (
//     <Drawer open={open} onClose={onClose} direction="right">
//       <DrawerContent className="ml-auto h-full w-full max-w-lg border-l shadow-xl">
//         <DrawerHeader className="flex flex-row items-center justify-between border-b py-0">
//           <DrawerTitle className="text-primary text-base leading-none">
//             Session Preview
//           </DrawerTitle>

//           {/* Close Button */}
//           <Button size="icon" variant="ghost" onClick={onClose}>
//             <X />
//           </Button>
//           {/* </div> */}
//         </DrawerHeader>

//         <ScrollArea className="h-[calc(100vh-60px)] p-5">
//           <div className="space-y-4">
//             {/* Session Name */}
//             <div>
//               <p className="text-lg font-medium text-[#3E3E3E]">
//                 {session.name} Academic Session
//               </p>
//             </div>

//             {/* Status */}
//             <div className="grid grid-cols-[45fr_55fr] gap-1">
//               <p className="text-text-secondary text-sm">Status</p>
//               <span
//                 className={`w-fit rounded-2xl px-2 py-0.5 text-xs font-medium ${
//                   session.status === "Active"
//                     ? "bg-emerald-100 text-emerald-700"
//                     : session.status === "Inactive"
//                       ? "bg-gray-200 text-gray-700"
//                       : "bg-yellow-100 text-yellow-600"
//                 }`}
//               >
//                 {session.status}
//               </span>
//             </div>

//             {/* Description */}
//             {session.description && (
//               <div className="grid grid-cols-[45fr_55fr] gap-1">
//                 <p className="text-text-secondary text-sm">Description</p>
//                 <p className="text-primary text-sm wrap-break-word">
//                   {session.description}
//                 </p>
//               </div>
//             )}

//             {/* Terms */}
//             {session.terms && session.terms.length > 0 && (
//               <div>
//                 {session.terms.map((term) => (
//                   <div
//                     key={term.id}
//                     className="grid grid-cols-[45fr_55fr] gap-1 space-y-4"
//                   >
//                     <p className="text-text-secondary text-sm">{term.name} Start Date</p>
//                     <p className="text-primary text-sm">{formatDate(term.startDate)}</p>
//                     <p className="text-text-secondary text-sm">{term.name} End Date</p>
//                     <p className="text-primary text-sm">{formatDate(term.endDate)}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </ScrollArea>
//       </DrawerContent>
//       <DrawerFooter>
//         <div className="flex justify-end gap-2">
//           {/* Edit Button */}
//           <Button
//             size="lg"
//             variant="outline"
//             disabled={session.status === "Archived"}
//             onClick={goToEdit}
//           >
//             <Pencil className="mr-1 h-4 w-4" /> Edit
//           </Button>
//         </div>
//       </DrawerFooter>
//     </Drawer>
//   )
// }
