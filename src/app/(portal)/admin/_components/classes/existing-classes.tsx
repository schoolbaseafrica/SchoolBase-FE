"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LuLayoutGrid } from "react-icons/lu"
import {
  ChevronDown,
  GraduationCap,
  Loader2Icon,
  MoreVerticalIcon,
  Plus,
  Search,
} from "lucide-react"
import { ClassItem } from "@/lib/classes"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteClass } from "../../class-management/_hooks/use-classes"
import { DeleteConfirmationDialog } from "@/components/users/delete-confirmation-dialog"

const EDIT_CLASS = (classID: string) => `/admin/class-management/class/${classID}/edit`

const ExistingClasses = ({ classesData }: { classesData: ClassItem[] }) => {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const deleteClasses = useDeleteClass().mutateAsync
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [toDelete, setToDelete] = useState<string>()

  const toggleClass = (className: string) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(className)) {
        newSet.delete(className)
      } else {
        newSet.add(className)
      }
      return newSet
    })
  }

  const filteredClasses = classesData.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasOtherClasses =
    filteredClasses.length < classesData.length && searchQuery === ""

  return (
    <article className="py-5">
      {/* Header with Search */}
      <div className="relative flex items-center justify-start gap-3">
        {classesData.length > 0 && (
          <div className="absolute right-0 bottom-full mb-10 hidden md:block">
            <Button asChild className="h-12 w-full lg:w-90">
              <Link
                href="/admin/class-management/class/new"
                className="flex items-center gap-2"
              >
                <Plus />
                Create Class
              </Link>
            </Button>
          </div>
        )}

        <div className="relative max-w-[250px] flex-1">
          <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pr-4 pl-9"
          />
        </div>
      </div>

      {/* Classes List */}
      <section className="mt-5 grid grid-cols-1 gap-5 space-y-3">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem) => {
            const isExpanded = expandedClasses.has(classItem.name)

            return (
              <div
                key={classItem.name}
                className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => toggleClass(classItem.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="text-base font-semibold text-gray-900">
                      {classItem.name}
                    </h5>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-gray-600">
                      <p>
                        {classItem.classes.length}{" "}
                        {classItem.classes.length === 1 ? "arm" : "arms"}
                      </p>
                      {/* {classItem.classTeacher && (
                        <p className="text-xs text-gray-500">
                          Teacher: {classItem.classTeacher}
                        </p>
                      )} */}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-gray-100"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    <ChevronDown
                      className={`size-5 transition-transform duration-300 ease-in-out ${
                        isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </Button>
                </div>

                {/* Expandable Arms List */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-4 space-y-2 border-t pt-3">
                      {classItem.classes.map((arm) => (
                        <li
                          key={arm.id}
                          className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                          onClick={() => viewClass(arm.id)}
                        >
                          <div className="text-accent bg-accent/10 group-hover:bg-accent/20 flex size-9 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110">
                            <GraduationCap className="size-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {classItem.name} {arm.arm}
                            </p>
                          </div>

                          {isLoading ? (
                            <Loader2Icon className="text-accent h-5 w-5 animate-spin" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <MoreVerticalIcon className="text-gray-600" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="w-fit"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem
                                  asChild
                                  className="flex items-center gap-2"
                                >
                                  <Link
                                    href={`/admin/class-management/class/${arm.id}/subjects`}
                                  >
                                    View Subjects
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleEdit(arm.id)}
                                  className="flex items-center gap-2"
                                >
                                  Edit
                                </DropdownMenuItem>

                                {/* <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    // onClick={() => onDelete(item.id)}
                                    disabled={!item.isActive}
                                  >
                                    <Edit size={16} /> Edit
                                  </DropdownMenuItem> */}

                                <DropdownMenuItem
                                  onClick={() => handleConfirmDelete(arm.id)}
                                  className="flex items-center gap-2"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          /* No Search Results */
          <div className="mx-auto mt-7 flex max-w-[400px] flex-col items-center gap-3.5 rounded-xl border border-dashed bg-gray-50 px-4 py-14">
            <div className="text-accent bg-accent/10 flex size-14 items-center justify-center rounded-full">
              <Search className="size-7" />
            </div>
            <h5 className="text-primary text-center text-xl font-semibold">
              No Classes Found
            </h5>
            <p className="text-text-secondary text-center text-sm">
              Try adjusting your search or create a new class
            </p>
          </div>
        )}
      </section>

      {/* No Other Classes Found (Only show when not searching and all classes displayed) */}
      {hasOtherClasses && (
        <div className="mx-auto mt-7 flex max-w-[400px] flex-col items-center gap-3.5 rounded-xl border border-dashed bg-gray-50 px-4 py-14">
          <div className="text-accent bg-accent/10 flex size-14 items-center justify-center rounded-full">
            <LuLayoutGrid className="size-7 font-normal" />
          </div>
          <h5 className="text-primary text-center text-xl font-semibold">
            All Classes Loaded
          </h5>
          <p className="text-text-secondary text-center text-sm md:hidden">
            Tap the {`'+'`} button below to create a new class
          </p>
        </div>
      )}

      {/* Button to Add New Class */}
      <div className="sticky bottom-10 my-5 flex justify-end md:hidden">
        <Button
          asChild
          className="h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110"
          size="icon"
        >
          <Link href="/admin/class-management/class/new" aria-label="Add new class">
            <Plus className="size-6" />
          </Link>
        </Button>
      </div>

      <DeleteConfirmationDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(undefined)}
        onConfirm={() => handleDelete(toDelete as string)}
        title="Delete Class"
        description="This action cannot be undone and will remove all associated data with this class."
      />

      {/* Button to View Subjects */}
      {/* <div className="flex justify-center">
        <Button asChild className="mx-auto w-full max-w-[400px] shadow-sm" size="lg">
          <Link href="/admin/class-management/subjects">View Subjects</Link>
        </Button>
      </div> */}
    </article>
  )

  async function handleDelete(armId: string) {
    setIsLoading(true)
    try {
      await deleteClasses(armId)
    } catch {
      console.log("Failed to delete class")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleConfirmDelete(armId: string) {
    if (!armId) {
      return
    }
    setToDelete(armId)
  }

  function handleEdit(armId: string) {
    router.push(EDIT_CLASS(armId))
  }

  function viewClass(armId: string) {
    router.push(`/admin/class-management/class/${armId}`)
  }
}

export default ExistingClasses

// "use client"

// import React, { useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { LuLayoutGrid } from "react-icons/lu"
// import { ChevronDown, GraduationCap, Pencil, Plus, Search } from "lucide-react"

// interface ClassData {
//   id: string
//   name: string
//   arms: string[]
// }

// const mockClasses: ClassData[] = [
//   {
//     id: "1",
//     name: "JSS 1",
//     arms: ["JSS 1A", "JSS 1B", "JSS 1C"],
//   },
//   // Add more classes as needed
// ]

// const ExistingClasses = () => {
//   const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())
//   const [searchQuery, setSearchQuery] = useState("")

//   const toggleClass = (classId: string) => {
//     setExpandedClasses((prev) => {
//       const newSet = new Set(prev)
//       if (newSet.has(classId)) {
//         newSet.delete(classId)
//       } else {
//         newSet.add(classId)
//       }
//       return newSet
//     })
//   }

//   const filteredClasses = mockClasses.filter((classItem) =>
//     classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
//   )

//   return (
//     <article className="pb-5">
//       <div className="flex items-center justify-between gap-3">
//         <h3 className="text-lg font-semibold">Classes</h3>
//         <div className="relative max-w-[250px] flex-1">
//           <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
//           <Input
//             type="search"
//             placeholder="Search classes..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-9"
//           />
//         </div>
//       </div>

//       {/* class view */}
//       <section className="mt-5 space-y-3">
//         {filteredClasses.map((classItem) => {
//           const isExpanded = expandedClasses.has(classItem.id)

//           return (
//             <div key={classItem.id} className="rounded-xl border p-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h5 className="text-base font-semibold">{classItem.name}</h5>
//                   <p className="text-text-secondary text-sm">
//                     {classItem.arms.length}{" "}
//                     {classItem.arms.length === 1 ? "class" : "classes"}
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => toggleClass(classItem.id)}
//                   className="h-8 w-8"
//                   aria-label={isExpanded ? "Collapse" : "Expand"}
//                 >
//                   <ChevronDown
//                     className={`size-5 transition-transform duration-300 ${
//                       isExpanded ? "rotate-180" : "rotate-0"
//                     }`}
//                   />
//                 </Button>
//               </div>

//               {/* Expandable arms list */}
//               <div
//                 className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                   isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//                 }`}
//               >
//                 <ul className="mt-4 space-y-2">
//                   {classItem.arms.map((arm) => (
//                     <li
//                       key={arm}
//                       className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
//                     >
//                       <div className="text-accent bg-accent/10 group-hover:bg-accent/20 flex size-9 items-center justify-center rounded-full transition-colors">
//                         <GraduationCap className="size-5" />
//                       </div>
//                       <p className="text-sm font-medium">{arm}</p>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
//                         aria-label={`Edit ${arm}`}
//                       >
//                         <Pencil className="size-4" />
//                       </Button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )
//         })}
//       </section>

//       {/* No other classes found */}
//       {filteredClasses.length === 0 ? (
//         <div className="mx-auto mt-7 flex max-w-[400px] flex-col items-center gap-3.5 rounded-xl border border-dashed px-4 py-14">
//           <div className="text-accent bg-accent/10 flex size-14 items-center justify-center rounded-full">
//             <Search className="size-7" />
//           </div>
//           <h5 className="text-primary text-center text-xl font-semibold">
//             No Classes Found
//           </h5>
//           <p className="text-text-secondary text-center text-sm">
//             Try adjusting your search or create a new class
//           </p>
//         </div>
//       ) : (
//         <div className="mx-auto mt-7 flex max-w-[400px] flex-col items-center gap-3.5 rounded-xl border border-dashed px-4 py-14">
//           <div className="text-accent bg-accent/10 flex size-14 items-center justify-center rounded-full">
//             <LuLayoutGrid className="size-7 font-normal" />
//           </div>
//           <h5 className="text-primary text-center text-xl font-semibold">
//             No Other Classes Found
//           </h5>
//           <p className="text-text-secondary text-center text-sm">
//             Tap {`'+'`} button below to create a new class
//           </p>
//         </div>
//       )}

//       {/* Button to add */}
//       <div className="my-5 flex justify-end">
//         <Button asChild className="rounded-full p-3" size="icon">
//           <Link href="/admin/class-management/class/new" aria-label="Add new class">
//             <Plus className="size-5" />
//           </Link>
//         </Button>
//       </div>

//       {/* Button to view subjects */}
//       <div className="flex justify-center">
//         <Button asChild className="mx-auto w-full max-w-[400px]">
//           <Link href="/admin/class-management/subjects">View Subjects</Link>
//         </Button>
//       </div>
//     </article>
//   )
// }

// export default ExistingClasses
