"use client"

import React, { useState } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import ManualCheckInCard from "./_components/manual-checkin-card"
import ClassTeacherView from "./_components/class-teacher-view"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  useGetTeacherAssignedClasses,
  useGetTodayCheckInStatus,
} from "./_hooks/use-teacher-attendance"

const TeacherAttendance = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    undefined
  )

  // Fetch assigned classes
  const {
    data: assignedClasses,
    isLoading: classesLoading,
    error: classesError,
  } = useGetTeacherAssignedClasses(selectedSessionId)

  // Fetch today's check-in status
  const { data: checkInStatus, isLoading: statusLoading } = useGetTodayCheckInStatus()

  const isLoading = classesLoading || statusLoading
  const hasCheckedIn = checkInStatus?.has_checked_in || false
  const isClassTeacher = assignedClasses && assignedClasses.length > 0

  return (
    <div className="px-5 pt-10">
      <DashboardTitle
        heading="Attendance"
        description="Manage your attendance and view your assigned classes"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="mt-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-500">Loading attendance information...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && classesError && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your assigned classes. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Check-in Status Banner */}
      {!isLoading && hasCheckedIn && (
        <Alert className="mt-5 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✓ You have checked in today at {checkInStatus?.check_in_time || "N/A"}
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !classesError && (
        <div className="mt-8 space-y-6">
          {/* Manual Check-in Card - Always shown */}
          <ManualCheckInCard hasCheckedIn={hasCheckedIn} />

          {/* Class Teacher View - Only if assigned as class teacher */}
          {isClassTeacher && (
            <ClassTeacherView
              assignedClasses={assignedClasses}
              selectedSessionId={selectedSessionId}
              onSessionChange={setSelectedSessionId}
            />
          )}

          {/* No Classes Message */}
          {!isClassTeacher && !hasCheckedIn && (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <p className="text-gray-500">
                You are not assigned as a class teacher for any class.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Please check in manually above to mark your attendance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherAttendance
// "use client"

// import React, { useState } from "react"
// import DashboardTitle from "@/components/dashboard/dashboard-title"
// import ManualCheckInCard from "./_components/manual-checkin-card"
// import ClassTeacherView from "./_components/class-teacher-view"
// import { Loader2, AlertCircle } from "lucide-react"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// import {
//   useGetTeacherAssignedClasses,
//   useGetTodayCheckInStatus,
// } from "./_hooks/use-teacher-attendance"

// const TeacherAttendance = () => {
//   const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
//     undefined
//   )

//   const {
//     data: assignedClasses,
//     isLoading: classesLoading,
//     error: classesError,
//   } = useGetTeacherAssignedClasses(selectedSessionId)

//   const { data: checkInStatus, isLoading: statusLoading } = useGetTodayCheckInStatus()

//   const isLoading = classesLoading || statusLoading
//   const hasCheckedIn = checkInStatus?.has_checked_in || false
//   const isClassTeacher = assignedClasses && assignedClasses.length > 0

//   return (
//     <div className="px-5 pt-10">
//       <DashboardTitle
//         heading="Attendance"
//         description="Manage your attendance and view your assigned classes"
//       />

//       {isLoading && (
//         <div className="mt-10 flex flex-col items-center justify-center py-20">
//           <Loader2 className="text-primary h-12 w-12 animate-spin" />
//           <p className="mt-4 text-gray-500">Loading attendance information...</p>
//         </div>
//       )}

//       {!isLoading && classesError && (
//         <Alert variant="destructive" className="mt-5">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             Failed to load your assigned classes. Please try again later.
//           </AlertDescription>
//         </Alert>
//       )}

//       {!isLoading && hasCheckedIn && (
//         <Alert className="mt-5 border-green-200 bg-green-50">
//           <AlertDescription className="text-green-800">
//             ✓ You have checked in today at {checkInStatus?.check_in_time || "N/A"}
//           </AlertDescription>
//         </Alert>
//       )}

//       {!isLoading && !classesError && (
//         <div className="mt-8 space-y-6">
//           <ManualCheckInCard hasCheckedIn={hasCheckedIn} />

//           {isClassTeacher && (
//             <ClassTeacherView
//               assignedClasses={assignedClasses}
//               selectedSessionId={selectedSessionId}
//               onSessionChange={setSelectedSessionId}
//             />
//           )}

//           {!isClassTeacher && !hasCheckedIn && (
//             <div className="rounded-xl border border-dashed py-12 text-center">
//               <p className="text-gray-500">
//                 You are not assigned as a class teacher for any class.
//               </p>
//               <p className="mt-2 text-sm text-gray-400">
//                 Please check in manually above to mark your attendance.
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// export default TeacherAttendance

// // "use client"

// // import React, { useState } from "react"
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card"
// // import { Button } from "@/components/ui/button"
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"
// // import { BookOpen, Users } from "lucide-react"
// // import { TeacherAssignedClass } from "@/lib/teacher-attendance"
// // import { useRouter } from "next/navigation"

// // interface ClassTeacherViewProps {
// //   assignedClasses: TeacherAssignedClass[]
// //   selectedSessionId?: string
// //   onSessionChange: (sessionId: string | undefined) => void
// // }

// // const ClassTeacherView: React.FC<ClassTeacherViewProps> = ({
// //   assignedClasses,
// //   selectedSessionId,
// //   onSessionChange,
// // }) => {
// //   const router = useRouter()
// //   const [selectedClassId, setSelectedClassId] = useState<string>("")

// //   // Set initial class when data loads
// //   React.useEffect(() => {
// //     if (assignedClasses && assignedClasses.length > 0 && !selectedClassId) {
// //       setSelectedClassId(assignedClasses[0].id)
// //     }
// //   }, [assignedClasses, selectedClassId])

// //   const handleMarkAttendance = () => {
// //     if (selectedClassId) {
// //       router.push(`/dashboard/teacher/attendance/mark/${selectedClassId}`)
// //     }
// //   }

// //   const handleViewAttendance = () => {
// //     if (selectedClassId) {
// //       router.push(`/dashboard/teacher/attendance/view/${selectedClassId}`)
// //     }
// //   }

// //   const selectedClass = assignedClasses?.find((cls) => cls.id === selectedClassId)

// //   if (!assignedClasses || assignedClasses.length === 0) {
// //     return null
// //   }

// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle className="flex items-center gap-2">
// //           <BookOpen className="h-5 w-5" />
// //           Class Teacher Dashboard
// //         </CardTitle>
// //         <CardDescription>Manage attendance for your assigned class</CardDescription>
// //       </CardHeader>
// //       <CardContent className="space-y-6">
// //         {/* Class Selection */}
// //         <div>
// //           <label className="mb-2 block text-sm font-medium">Select Your Class</label>
// //           <Select value={selectedClassId} onValueChange={setSelectedClassId}>
// //             <SelectTrigger>
// //               <SelectValue placeholder="Select a class" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {assignedClasses.map((cls) => (
// //                 <SelectItem key={cls.id} value={cls.id}>
// //                   {cls.name} {cls.arm && `- ${cls.arm}`}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>
// //         </div>

// //         {/* Class Details */}
// //         {selectedClass && (
// //           <div className="rounded-lg border bg-gray-50 p-4">
// //             <div className="flex items-start justify-between">
// //               <div>
// //                 <h3 className="font-semibold text-gray-900">
// //                   {selectedClass.name} {selectedClass.arm && `- ${selectedClass.arm}`}
// //                 </h3>
// //                 <p className="mt-1 text-sm text-gray-600">
// //                   Academic Session: {selectedClass.academicSession.name}
// //                 </p>
// //               </div>
// //               <div className="flex items-center gap-2 text-sm text-gray-600">
// //                 <Users className="h-4 w-4" />
// //                 <span>{selectedClass.teacherIds.length} Teacher(s)</span>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Action Buttons */}
// //         <div className="grid gap-3 sm:grid-cols-2">
// //           <Button
// //             onClick={handleMarkAttendance}
// //             disabled={!selectedClassId}
// //             className="w-full"
// //           >
// //             Mark Attendance
// //           </Button>
// //           <Button
// //             onClick={handleViewAttendance}
// //             disabled={!selectedClassId}
// //             variant="outline"
// //             className="w-full"
// //           >
// //             View Attendance
// //           </Button>
// //         </div>

// //         {/* Info */}
// //         <div className="rounded-lg bg-blue-50 p-4">
// //           <p className="text-sm text-blue-800">
// //             <strong>Note:</strong> As a class teacher, you can mark and view attendance
// //             for students in your assigned class.
// //           </p>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   )
// // }

// // export default ClassTeacherView

// // // "use client"

// // // import { useState } from "react"
// // // import { Button } from "@/components/ui/button"
// // // import { SuccessModal } from "@/components/dashboard/success-modal"
// // // import { Loader2 } from "lucide-react"
// // // import StudentRow from "./_components/student-row"
// // // import { format } from "date-fns"

// // // /* TYPES */
// // // interface Student {
// // //   id: string
// // //   name: string
// // //   present: boolean
// // // }

// // // interface Attendance {
// // //   date: string
// // //   students: Student[]
// // // }

// // // /* COMPONENT */
// // // const AttendancePage = () => {
// // //   const today = format(new Date(), "yyyy-MM-dd")

// // //   const [selectedDate, setSelectedDate] = useState<string>(today)
// // //   const [modalOpen, setModalOpen] = useState(false)
// // //   const [submitting, setSubmitting] = useState(false)

// // //   // Initialize attendance state directly
// // //   const [attendance, setAttendance] = useState<Attendance>(() => {
// // //     const dummyStudents: Student[] = [
// // //       { id: "1", name: "John Alex", present: false },
// // //       { id: "2", name: "Mary Jonah", present: false },
// // //       { id: "3", name: "Samuel Victor", present: false },
// // //       { id: "4", name: "Ade Victor", present: false },
// // //       { id: "5", name: "Badejo Boku", present: false },
// // //       { id: "6", name: "Seyi Funmi", present: false },
// // //       { id: "7", name: "Bakare Victor", present: false },
// // //       { id: "8", name: "Victor Blessing", present: false },
// // //       { id: "9", name: "Samuel Victor", present: false },
// // //     ]

// // //     // Load from localStorage if available
// // //     const studentsWithSaved = dummyStudents.map((student) => ({
// // //       ...student,
// // //       // present: localStorage.getItem(`attendance_${today}_${student.id}`) === "true",
// // //     }))

// // //     return { date: today, students: studentsWithSaved }
// // //   })

// // //   // const isToday = selectedDate === today
// // //   const isLocked = false

// // //   const toggleStudent = (id: string) => {
// // //     setAttendance((prev) => ({
// // //       ...prev,
// // //       students: prev.students.map((s) =>
// // //         s.id === id ? { ...s, present: !s.present } : s
// // //       ),
// // //     }))
// // //   }

// // //   const markAllPresent = () => {
// // //     setAttendance((prev) => ({
// // //       ...prev,
// // //       students: prev.students.map((s) => ({ ...s, present: true })),
// // //     }))
// // //   }

// // //   const handleSubmit = () => {
// // //     setSubmitting(true)

// // //     attendance.students.forEach((s) => {
// // //       localStorage.setItem(
// // //         `attendance_${selectedDate}_${s.id}`,
// // //         s.present ? "true" : "false"
// // //       )
// // //     })

// // //     setTimeout(() => {
// // //       setSubmitting(false)
// // //       setModalOpen(true)
// // //     }, 700)
// // //   }

// // //   const anyChecked = attendance.students.some((s) => s.present)

// // //   return (
// // //     <div className="space-y-6 p-6">
// // //       {/* HEADER + DATE PICKER */}
// // //       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
// // //         <h1 className="text-2xl font-semibold">Attendance</h1>

// // //         <div className="flex items-center gap-2">
// // //           Date
// // //           <input
// // //             type="date"
// // //             value={selectedDate}
// // //             max={today}
// // //             onChange={(e) => setSelectedDate(e.target.value)}
// // //             className="rounded-md border px-2 py-1 text-sm"
// // //           />
// // //         </div>
// // //       </div>

// // //       {/* STUDENT LIST */}
// // //       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
// // //         {attendance.students.map((student) => (
// // //           <StudentRow
// // //             key={student.id}
// // //             student={student}
// // //             isLocked={isLocked}
// // //             toggleStudent={toggleStudent}
// // //           />
// // //         ))}
// // //       </div>

// // //       {/* ACTION BUTTONS */}
// // //       <div className="grid max-w-lg grid-cols-2 gap-2 space-y-3 lg:gap-10">
// // //         <Button
// // //           variant="outline"
// // //           size="lg"
// // //           className="w-full py-5"
// // //           onClick={markAllPresent}
// // //         >
// // //           Mark All Present
// // //         </Button>

// // //         <Button
// // //           size="lg"
// // //           className="w-full bg-red-600 py-5 text-white hover:bg-red-700"
// // //           onClick={handleSubmit}
// // //           disabled={submitting || !anyChecked}
// // //         >
// // //           {submitting ? (
// // //             <Loader2 className="h-5 w-5 animate-spin" />
// // //           ) : (
// // //             "Submit Attendance"
// // //           )}
// // //         </Button>
// // //       </div>

// // //       {/* SUCCESS MODAL */}
// // //       <SuccessModal
// // //         open={modalOpen}
// // //         onOpenChange={setModalOpen}
// // //         title="Attendance Submitted"
// // //         message="Your attendance for today has been recorded successfully."
// // //         onAction={() => setModalOpen(false)}
// // //       />
// // //     </div>
// // //   )
// // // }

// // // export default AttendancePage
