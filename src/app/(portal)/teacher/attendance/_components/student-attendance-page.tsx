// "use client"

// import { useEffect, useState } from "react"
// import { Loader2 } from "lucide-react"
// import { format } from "date-fns"
// import { Pagination } from "@/components/ui/pagination"

// type AttendanceStatus = "present" | "absent" | "late" | "excused"

// type DailyAttendance = {
//   id: string
//   date: string
//   status: AttendanceStatus
// }

// type StudentAttendanceResponse = {
//   student_id: string
//   student_name: string
//   records: DailyAttendance[]
//   total_records: number
// }

// type Props = {
//   studentId: string
//   startDate: string
//   endDate: string
// }

// const STATUS_COLOR: Record<AttendanceStatus, string> = {
//   present: "bg-green-100 text-green-800",
//   absent: "bg-red-100 text-red-800",
//   late: "bg-yellow-100 text-yellow-800",
//   excused: "bg-gray-100 text-gray-800",
// }

// const StudentAttendancePage = ({ studentId, startDate, endDate }: Props) => {
//   const [loading, setLoading] = useState(true)
//   const [attendance, setAttendance] = useState<StudentAttendanceResponse | null>(null)
//   const [page, setPage] = useState(1)
//   const limit = 10

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true)
//       const data = await fetchStudentAttendance(
//         studentId,
//         startDate,
//         endDate,
//         page,
//         limit
//       )
//       setAttendance(data)
//       setLoading(false)
//     }
//     load()
//   }, [studentId, startDate, endDate, page])

//   if (loading || !attendance) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <Loader2 className="h-6 w-6 animate-spin text-red-600" />
//       </div>
//     )
//   }

//   // Compute summary counts
//   const summary = attendance.records.reduce(
//     (acc, rec) => {
//       acc[rec.status] += 1
//       return acc
//     },
//     { present: 0, absent: 0, late: 0, excused: 0 } as Record<AttendanceStatus, number>
//   )

//   return (
//     <div className="mx-auto max-w-3xl space-y-6 p-6">
//       <h1 className="text-2xl font-semibold">
//         {attendance.student_name} — Term Attendance
//       </h1>

//       {/* Term Summary */}
//       <div className="grid grid-cols-4 gap-4">
//         {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(
//           (status) => (
//             <div
//               key={status}
//               className={`flex flex-col items-center justify-center rounded-lg p-4 ${STATUS_COLOR[status]}`}
//             >
//               <span className="text-sm font-medium capitalize">{status}</span>
//               <span className="text-xl font-bold">{summary[status]}</span>
//             </div>
//           )
//         )}
//       </div>

//       {/* Attendance Table */}
//       <table className="mt-4 w-full table-auto border-collapse">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border p-2 text-left">Date</th>
//             <th className="border p-2 text-left">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {attendance.records.map((record) => (
//             <tr key={record.id} className="hover:bg-gray-50">
//               <td className="border p-2">
//                 {format(new Date(record.date), "dd MMM yyyy")}
//               </td>
//               <td className="border p-2">
//                 <span
//                   className={`rounded-full px-2 py-1 text-sm font-medium ${STATUS_COLOR[record.status]}`}
//                 >
//                   {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div className="flex justify-end">
//         <Pagination
//           total={attendance.total_records}
//           page={page}
//           onPageChange={(p) => setPage(p)}
//           pageSize={limit}
//         />
//       </div>
//     </div>
//   )
// }

// export default StudentAttendancePage
