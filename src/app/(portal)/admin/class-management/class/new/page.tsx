"use client"

import { useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { ArrowLeft } from "lucide-react"
import AddClassForm, { ClassFormData } from "../../../_components/classes/add-class-form"
import { useCreateClass } from "../../_hooks/use-classes"
import { findTeacherBySearch } from "../../../teachers/_hooks/use-teachers"

const AddClass = () => {
  const router = useRouter()
  const createNewClass = useCreateClass().mutateAsync

  const handleCreateClass = async (data: ClassFormData) => {
    let teacher = null
    if (data.classTeacher) {
      try {
        teacher = await findTeacherBySearch(data?.classTeacher)
      } catch {
        throw new Error("An error occurred while adding the teacher to the class.")
      }
    }

    if (!teacher && data.classTeacher) {
      throw new Error("The specified class teacher does not exist.")
    }

    await createNewClass({
      name: data.className,
      arm: data.arm,
      teacherIds: [teacher?.id].filter(Boolean) as string[],
    })
    router.push("/admin/class-management/class")
  }

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="flex cursor-pointer items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        aria-label="Go back"
      >
        <ArrowLeft className="size-5" />
      </button>

      <section className="mt-5 lg:mx-5">
        <DashboardTitle
          heading="Add New Class"
          description="Enter the details of the new class"
        />

        <AddClassForm onSubmit={handleCreateClass} />
      </section>
    </div>
  )
}

export default AddClass

// import React from "react"
// import DashboardTitle from "@/components/dashboard/dashboard-title"
// import { ArrowLeft } from "lucide-react"
// import AddClassForm from "../../../_components/classes/add-class-form"

// const AddClass = () => {
//   return (
//     <div className="p-4">
//       <ArrowLeft />

//       <section className="mt-5 lg:mx-5">
//         <DashboardTitle
//           heading="Add New Class"
//           description="Enter the details of the new teacher"
//         />

//         <AddClassForm />
//       </section>
//     </div>
//   )
// }

// export default AddClass
