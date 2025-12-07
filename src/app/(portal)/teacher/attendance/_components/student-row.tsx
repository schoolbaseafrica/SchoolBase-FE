import { useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { animate } from "motion"

type Student = {
  id: string
  name: string
  present: boolean
}

type StudentRowProps = {
  student: Student
  isLocked: boolean
  toggleStudent: (id: string) => void
  submitStudent?: () => void // optional per-student submit
}

const StudentRow = ({
  student,
  isLocked,
  toggleStudent,
  submitStudent,
}: StudentRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rowRef.current) {
      animate(
        rowRef.current,
        { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] },
        { duration: 0.25 }
      )
    }
  }, [])

  const handleClick = () => {
    if (!isLocked) {
      toggleStudent(student.id)
    }
  }

  return (
    <div
      ref={rowRef}
      onClick={handleClick}
      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${student.present ? "border-green-300" : "border-accent/50"} ${isLocked ? "cursor-not-allowed opacity-50" : "hover:bg-accent/10 cursor-pointer"}`}
    >
      <p className="text-sm font-medium">{student.name}</p>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={student.present}
          disabled={isLocked}
          onCheckedChange={() => toggleStudent(student.id)}
        />

        {submitStudent && (
          <button
            onClick={(e) => {
              e.stopPropagation() // prevent row toggle
              submitStudent()
            }}
            disabled={isLocked}
            className="text-xs text-blue-600 hover:underline"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  )
}

export default StudentRow

// import { useEffect, useRef } from "react"
// import { Checkbox } from "@/components/ui/checkbox"
// import { animate } from "motion"

// type Student = {
//   id: string
//   name: string
//   present: boolean
// }

// type StudentRowProps = {
//   student: Student
//   isLocked: boolean
//   toggleStudent: (id: string) => void
// }

// const StudentRow = ({ student, isLocked, toggleStudent }: StudentRowProps) => {
//   const rowRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (rowRef.current) {
//       animate(
//         rowRef.current,
//         { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] },
//         { duration: 0.25 }
//       )
//     }
//   }, [])

//   const handleClick = () => {
//     if (!isLocked) {
//       toggleStudent(student.id)
//     }
//   }

//   return (
//     <div
//       ref={rowRef}
//       onClick={handleClick}
//       className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${student.present ? "border-green-300" : "border-accent/50"} ${isLocked ? "cursor-not-allowed opacity-50" : "hover:bg-accent/10"} `}
//     >
//       <p className="text-sm font-medium">{student.name}</p>

//       {/* Keep checkbox for accessibility */}
//       <Checkbox
//         checked={student.present}
//         disabled={isLocked}
//         onCheckedChange={() => toggleStudent(student.id)}
//         className="pointer-events-none"
//       />
//     </div>
//   )
// }

// export default StudentRow

// // import { useEffect, useRef } from "react"
// // import { Checkbox } from "@/components/ui/checkbox"
// // import { animate } from "motion"

// // type Student = {
// //   id: string
// //   name: string
// //   present: boolean
// // }

// // type StudentRowProps = {
// //   student: Student
// //   isLocked: boolean
// //   toggleStudent: (id: string) => void
// // }

// // const StudentRow = ({ student, isLocked, toggleStudent }: StudentRowProps) => {
// //   const rowRef = useRef<HTMLDivElement>(null)

// //   useEffect(() => {
// //     if (rowRef.current) {
// //       animate(
// //         rowRef.current,
// //         { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] },
// //         { duration: 0.25 }
// //       )
// //     }
// //   }, [])

// //   return (
// //     <div ref={rowRef} className="flex items-center justify-between rounded-lg border p-3">
// //       <p className="text-sm font-medium">{student.name}</p>

// //       <Checkbox
// //         checked={student.present}
// //         disabled={isLocked}
// //         onCheckedChange={() => toggleStudent(student.id)}
// //         className={isLocked ? "cursor-not-allowed opacity-50" : ""}
// //       />
// //     </div>
// //   )
// // }

// // export default StudentRow
