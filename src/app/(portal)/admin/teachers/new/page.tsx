import { ArrowLeftIcon } from "lucide-react"
import NewTeacherForm from "./components/new-teacher-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AddNewTeacher() {
  return (
    <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
      <div>
        <div className="mb-4 md:mb-0 md:hidden">
          <Button
            asChild
            variant="ghost"
            className="bg-gray-100 hover:bg-gray-200"
            size="icon"
          >
            <Link href="/admin/teachers">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Add New Teacher</h1>
        <p className="text-gray-600">Enter details of the new teacher.</p>
      </div>
      <div>
        <NewTeacherForm />
      </div>
    </div>
  )
}
