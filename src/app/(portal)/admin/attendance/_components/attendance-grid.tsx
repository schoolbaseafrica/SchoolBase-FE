"use client"

import React from "react"
import { AttendanceStudent, AttendanceResponse } from "@/lib/attendance"

interface AttendanceGridProps {
  data?: AttendanceResponse
  students?: AttendanceStudent[]
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({ data, students = [] }) => {
  if (!data || !students || students.length === 0) return null

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800"
      case "ABSENT":
        return "bg-red-100 text-red-800"
      case "LATE":
        return "bg-yellow-100 text-yellow-800"
      case "EXCUSED":
        return "bg-blue-100 text-blue-800"
      case "HALF_DAY":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="mt-5 grid gap-4 lg:hidden">
      {students.map((student: AttendanceStudent, index: number) => (
        <div
          key={student.student_id}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">S/N: {index + 1}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(student.status)}`}
            >
              {student.status.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="font-semibold text-gray-900">
                {student.first_name} {student.middle_name || ""} {student.last_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-medium text-gray-700">{data.class_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="font-medium text-gray-700">
                  {student.check_in_time || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Check-out</p>
                <p className="font-medium text-gray-700">
                  {student.check_out_time || "-"}
                </p>
              </div>
            </div>

            {student.notes && (
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-600">{student.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AttendanceGrid
// "use client"

// import React from "react"
// import { AttendanceStudent, AttendanceResponse } from "@/lib/attendance"

// interface AttendanceGridProps {
//   data: AttendanceResponse | undefined
// }

// const AttendanceGrid: React.FC<AttendanceGridProps> = ({ data }) => {
//   if (!data) return null

//   return (
//     <div className="mt-5 grid gap-4 lg:hidden">
//       {data.students.map((student: AttendanceStudent, index: number) => (
//         <div key={student.student_id} className="rounded-lg border p-4 shadow-sm">
//           <p className="text-sm text-gray-500">S/N</p>
//           <p className="mb-2 font-semibold">{index + 1}</p>

//           <p className="text-sm text-gray-500">Student Name</p>
//           <p className="mb-2 font-semibold">
//             {student.first_name} {student.middle_name || ""} {student.last_name}
//           </p>

//           <p className="text-sm text-gray-500">Class</p>
//           <p className="mb-2 font-semibold">{data.class_id}</p>

//           <p className="text-sm text-gray-500">Status</p>
//           <p className="mb-2 font-semibold">{student.status}</p>

//           <p className="text-sm text-gray-500">Check-in</p>
//           <p className="mb-2 font-semibold">{student.check_in_time || "-"}</p>

//           <p className="text-sm text-gray-500">Check-out</p>
//           <p className="font-semibold">{student.check_out_time || "-"}</p>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default AttendanceGrid
