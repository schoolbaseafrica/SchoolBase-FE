"use client"

import { useParams, useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { ArrowLeft } from "lucide-react"
import AddClassForm, {
  ClassFormData,
} from "../../../../_components/classes/add-class-form"
import { useUpdateClass, useGetClass } from "../../../_hooks/use-classes"
import { ItemLoader } from "@/app/(portal)/admin/_components/sub-loader"
import { ItemsError } from "@/app/(portal)/admin/_components/loading-error"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const EditClass = () => {
  const classID = useParams().classID as string
  const { data: classData, isLoading, isError, error, refetch } = useGetClass(classID)

  const prefilledData = classData && {
    academicSession: classData.academicSession?.name,
    className: classData.name,
    arm: classData.arm,
  }

  const router = useRouter()
  const updateNewClass = useUpdateClass(classID).mutateAsync

  const handleUpdateClass = async (data: ClassFormData) => {
    await updateNewClass({
      id: classID,
      name: data.className,
      arm: data.arm,
    })
    router.push("/admin/class-management/class")
  }

  return (
    <div className="p-4">
      <Button asChild className="bg-gray-100" variant="ghost" size="icon">
        <Link
          href="/admin/class-management/class"
          aria-label="Go back to classes"
          className="flex"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </Button>

      <section className="mt-5 lg:mx-5">
        <DashboardTitle
          heading="Edit Class"
          description="Update the details of an existing class"
        />

        {isLoading ? (
          <ItemLoader item="Class Info" />
        ) : isError || !classData ? (
          <ItemsError
            item="Class Information"
            reload={refetch}
            errorMessage={
              isError
                ? error?.message || "An unexpected error occurred."
                : "Class does not exist!"
            }
          />
        ) : (
          <AddClassForm onSubmit={handleUpdateClass} defaultValues={prefilledData} />
        )}
      </section>
    </div>
  )
}

export default EditClass

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
