"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle2, Loader2 } from "lucide-react"
import { useManualCheckIn } from "../_hooks/use-teacher-attendance"

interface ManualCheckInCardProps {
  hasCheckedIn: boolean
}

const ManualCheckInCard: React.FC<ManualCheckInCardProps> = ({ hasCheckedIn }) => {
  const [reason, setReason] = useState("")
  const { mutate: checkIn, isPending } = useManualCheckIn()

  const handleCheckIn = () => {
    if (!reason.trim()) {
      return
    }

    const now = new Date()
    const date = now.toISOString().split("T")[0] // YYYY-MM-DD
    const check_in_time = now.toTimeString().split(" ")[0] // HH:MM:SS

    // Debug logging
    // console.log("📤 Submitting check-in:")
    // console.log("  Date:", date)
    // console.log("  Time:", check_in_time)
    // console.log("  Reason:", reason.trim())
    // console.log("  Payload:", { date, check_in_time, reason: reason.trim() })

    checkIn(
      { date, check_in_time, reason: reason.trim() },
      {
        onSuccess: () => {
          // console.log("✅ Check-in successful, clearing form")
          setReason("")
        },
        onError: (error) => {
          console.error("❌ Check-in failed:", error)
        },
      }
    )
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card className="overflow-hidden">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="text-accent h-5 w-5" />
          Manual Check-in
        </CardTitle>
        <CardDescription className="text-sm">
          Record your attendance for {today}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {hasCheckedIn ? (
          <div className="flex items-start gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">You are all set!</p>
              <p className="mt-1 text-sm text-green-600">
                You have already checked in for today. Have a great day!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date
                </Label>
                <Input
                  id="date"
                  type="text"
                  value={today}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                  Current Time
                </Label>
                <Input
                  id="time"
                  type="text"
                  value={currentTime}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Reason for Check-in <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your check-in (e.g., On duty, Meeting, Training, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                This information will be recorded with your attendance.
              </p>
            </div>

            <Button
              onClick={handleCheckIn}
              disabled={!reason.trim() || isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Checking in...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Check In Now
                </>
              )}
            </Button>

            {!reason.trim() && (
              <p className="text-center text-xs text-gray-500">
                Please enter a reason to enable check-in
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ManualCheckInCard
// "use client"

// import React, { useState } from "react"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Clock, CheckCircle2, Loader2 } from "lucide-react"
// import { useManualCheckIn } from "../_hooks/use-teacher-attendance"

// interface ManualCheckInCardProps {
//   hasCheckedIn: boolean
// }

// const ManualCheckInCard: React.FC<ManualCheckInCardProps> = ({ hasCheckedIn }) => {
//   const [reason, setReason] = useState("")
//   const { mutate: checkIn, isPending } = useManualCheckIn()

//   const handleCheckIn = () => {
//     if (!reason.trim()) {
//       return
//     }

//     const now = new Date()
//     const date = now.toISOString().split("T")[0] // YYYY-MM-DD
//     const check_in_time = now.toTimeString().split(" ")[0] // HH:MM:SS

//     // Debug logging
//     // console.log("📤 Submitting check-in:")
//     // console.log("  Date:", date)
//     // console.log("  Time:", check_in_time)
//     // console.log("  Reason:", reason.trim())
//     // console.log("  Payload:", { date, check_in_time, reason: reason.trim() })

//     checkIn(
//       { date, check_in_time, reason: reason.trim() },
//       {
//         onSuccess: () => {
//           // console.log("✅ Check-in successful, clearing form")
//           setReason("")
//         },
//         onError: (error) => {
//           console.error("❌ Check-in failed:", error)
//         },
//       }
//     )
//   }

//   const today = new Date().toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   })

//   const currentTime = new Date().toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   })

//   return (
//     <Card className="overflow-hidden">
//       <CardHeader className="">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <Clock className="text-accent h-5 w-5" />
//           Manual Check-in
//         </CardTitle>
//         <CardDescription className="text-sm">
//           Record your attendance for {today}
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4 pt-6">
//         {hasCheckedIn ? (
//           <div className="flex items-start gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
//             <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
//             <div>
//               <p className="font-semibold text-green-800">You are all set!</p>
//               <p className="mt-1 text-sm text-green-600">
//                 You have already checked in for today. Have a great day!
//               </p>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="grid gap-4 sm:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="date" className="text-sm font-medium text-gray-700">
//                   Date
//                 </Label>
//                 <Input
//                   id="date"
//                   type="text"
//                   value={today}
//                   disabled
//                   className="bg-gray-50 text-gray-600"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="time" className="text-sm font-medium text-gray-700">
//                   Current Time
//                 </Label>
//                 <Input
//                   id="time"
//                   type="text"
//                   value={currentTime}
//                   disabled
//                   className="bg-gray-50 text-gray-600"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
//                 Reason for Check-in <span className="text-red-500">*</span>
//               </Label>
//               <Textarea
//                 id="reason"
//                 placeholder="Please provide a reason for your check-in (e.g., On duty, Meeting, Training, etc.)"
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 className="min-h-[120px] resize-none"
//                 disabled={isPending}
//               />
//               <p className="text-xs text-gray-500">
//                 This information will be recorded with your attendance.
//               </p>
//             </div>

//             <Button
//               onClick={handleCheckIn}
//               disabled={!reason.trim() || isPending}
//               className="w-full"
//               size="lg"
//             >
//               {isPending ? (
//                 <>
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                   Checking in...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle2 className="mr-2 h-5 w-5" />
//                   Check In Now
//                 </>
//               )}
//             </Button>

//             {!reason.trim() && (
//               <p className="text-center text-xs text-gray-500">
//                 Please enter a reason to enable check-in
//               </p>
//             )}
//           </>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// export default ManualCheckInCard
