"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"
import { AttendanceStudent, AttendanceResponse } from "@/lib/attendance"

interface AttendanceTableProps {
  data?: AttendanceResponse
  students?: AttendanceStudent[]
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data, students }) => {
  if (!data || students?.length === 0) return null

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
    <div className="mt-10 hidden overflow-hidden rounded-xl border lg:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-primary text-center">S/N</TableHead>
            <TableHead className="text-primary text-center">Student Name</TableHead>
            <TableHead className="text-primary text-center">Class</TableHead>
            <TableHead className="text-primary text-center">Status</TableHead>
            <TableHead className="text-primary text-center">Check-in</TableHead>
            <TableHead className="text-primary text-center">Check-out</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students?.map((student: AttendanceStudent, index: number) => (
            <TableRow key={student.student_id}>
              <TableCell className="text-text-secondary text-center">
                {index + 1}
              </TableCell>
              <TableCell className="text-text-secondary text-center">
                {student.first_name} {student.middle_name || ""} {student.last_name}
              </TableCell>
              <TableCell className="text-text-secondary text-center">
                {data.class_id}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(student.status)}`}
                >
                  {student.status.replace("_", " ")}
                </span>
              </TableCell>
              <TableCell className="text-text-secondary text-center">
                {student.check_in_time || "-"}
              </TableCell>
              <TableCell className="text-text-secondary text-center">
                {student.check_out_time || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AttendanceTable
// "use client"

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import React from "react"
// import { AttendanceStudent, AttendanceResponse } from "@/lib/attendance"

// interface AttendanceTableProps {
//   data: AttendanceResponse | undefined
// }

// const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
//   if (!data) return null

//   return (
//     <div className="mt-10 hidden overflow-hidden rounded-xl border lg:block">
//       <Table>
//         <TableHeader>
//           <TableRow className="bg-gray-50">
//             <TableHead className="text-primary text-center">S/N</TableHead>
//             <TableHead className="text-primary text-center">Student Name</TableHead>
//             <TableHead className="text-primary text-center">Class</TableHead>
//             <TableHead className="text-primary text-center">Status</TableHead>
//             <TableHead className="text-primary text-center">Check-in</TableHead>
//             <TableHead className="text-primary text-center">Check-out</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {data.students.map((student: AttendanceStudent, index: number) => (
//             <TableRow key={student.student_id}>
//               <TableCell className="text-text-secondary text-center">
//                 {index + 1}
//               </TableCell>
//               <TableCell className="text-text-secondary text-center">
//                 {student.first_name} {student.middle_name || ""} {student.last_name}
//               </TableCell>
//               <TableCell className="text-text-secondary text-center">
//                 {data.class_id}
//               </TableCell>
//               <TableCell className="text-text-secondary text-center">
//                 {student.status}
//               </TableCell>
//               <TableCell className="text-text-secondary text-center">
//                 {student.check_in_time || "-"}
//               </TableCell>
//               <TableCell className="text-text-secondary text-center">
//                 {student.check_out_time || "-"}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// export default AttendanceTable

// // "use client"

// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table"
// // import React from "react"
// // import { AttendanceStudent, AttendanceResponse } from "@/lib/attendance"

// // interface AttendanceTableProps {
// //   data: AttendanceResponse | undefined
// // }

// // const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
// //   if (!data) return null

// //   return (
// //     <div className="mt-10 hidden overflow-hidden rounded-xl border lg:block">
// //       <Table>
// //         <TableHeader>
// //           <TableRow className="bg-gray-50">
// //             <TableHead className="text-primary text-center">S/N</TableHead>
// //             <TableHead className="text-primary text-center">Student Name</TableHead>
// //             <TableHead className="text-primary text-center">Class</TableHead>
// //             <TableHead className="text-primary text-center">Status</TableHead>
// //             <TableHead className="text-primary text-center">Check-in Time</TableHead>
// //             <TableHead className="text-primary text-center">Check-out Time</TableHead>
// //           </TableRow>
// //         </TableHeader>

// //         <TableBody>
// //           {data.students.map((student: AttendanceStudent, index: number) => (
// //             <TableRow key={student.student_id}>
// //               <TableCell className="text-text-secondary text-center">
// //                 {index + 1}
// //               </TableCell>
// //               <TableCell className="text-text-secondary text-center">
// //                 {student.first_name} {student.middle_name || ""} {student.last_name}
// //               </TableCell>
// //               <TableCell className="text-text-secondary text-center">
// //                 {data.class_id}
// //               </TableCell>
// //               <TableCell className="text-text-secondary text-center">
// //                 {student.status}
// //               </TableCell>
// //               <TableCell className="text-text-secondary text-center">
// //                 {student.check_in_time || "-"}
// //               </TableCell>
// //               <TableCell className="text-text-secondary text-center">
// //                 {student.check_out_time || "-"}
// //               </TableCell>
// //             </TableRow>
// //           ))}
// //         </TableBody>
// //       </Table>
// //     </div>
// //   )
// // }

// // export default AttendanceTable

// // // import {
// // //   Table,
// // //   TableBody,
// // //   TableCell,
// // //   TableHead,
// // //   TableHeader,
// // //   TableRow,
// // // } from "@/components/ui/table"
// // // import React from "react"

// // // const AttendanceTable = () => {
// // //   return (
// // //     <div className="mt-10 hidden overflow-hidden rounded-xl border lg:block">
// // //       <Table>
// // //         <TableHeader>
// // //           <TableRow className="bg-gray-50">
// // //             <TableHead className="text-primary text-center">S/N</TableHead>
// // //             <TableHead className="text-primary text-center">Student Name</TableHead>
// // //             <TableHead className="text-primary text-center">Class</TableHead>
// // //             <TableHead className="text-primary text-center">No of days Present</TableHead>
// // //             <TableHead className="text-primary text-center">No of days Absent</TableHead>
// // //           </TableRow>
// // //         </TableHeader>

// // //         <TableBody>
// // //           <TableRow>
// // //             <TableCell className="text-text-secondary text-center">1</TableCell>
// // //             <TableCell className="text-text-secondary text-center">Ade</TableCell>
// // //             <TableCell className="text-text-secondary text-center">Jss3</TableCell>
// // //             <TableCell className="text-text-secondary text-center">30</TableCell>
// // //             <TableCell className="text-text-secondary text-center">30</TableCell>
// // //           </TableRow>
// // //         </TableBody>
// // //       </Table>
// // //     </div>
// // //   )
// // // }

// // // export default AttendanceTable
