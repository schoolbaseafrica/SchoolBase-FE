"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { SnakeUser as User } from "@/types/user"
import { getInitials } from "@/lib/utils"

interface SelectedStudent {
  student: User
  relationship: string
}

interface LinkStudentsTableProps {
  students: User[]
  selectedStudents: SelectedStudent[]
  onStudentSelect: (student: User, selected: boolean) => void
  onRelationshipChange: (studentId: string, relationship: string) => void
  isLoading?: boolean
}

const relationshipOptions = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
]

export default function LinkStudentsTable({
  students,
  selectedStudents,
  onStudentSelect,
  onRelationshipChange,
  isLoading = false,
}: LinkStudentsTableProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const toggleDropdown = (studentId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S/N</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Reg Number</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Relationship</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-4 rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="h-4 w-40 rounded bg-gray-200" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-24 rounded bg-gray-200" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="rounded-md border py-8 text-center">
        <p className="text-gray-500">No students found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead className="w-12">S/N</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Reg Number</TableHead>
            {/* <TableHead>Class</TableHead> */}
            <TableHead>Relationship</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedStudents.map((std, index) => (
            <StudentItem
              index={index}
              key={std.student.id}
              student={std.student}
              isSelected={true}
              onSelect={onStudentSelect}
              hasDropdownOpen={openDropdowns.has(std.student.id)}
              toggleDropdown={toggleDropdown}
              relationship={std.relationship}
              onRelationshipChange={onRelationshipChange}
            />
          ))}
          {students.map((student, index) => (
            <StudentItem
              key={student.id}
              index={index}
              student={student}
              isSelected={false}
              onSelect={onStudentSelect}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface StudentItemProps {
  index: number
  student: User
  isSelected: boolean
  onSelect: (student: User, selected: boolean) => void
  relationship?: string
  hasDropdownOpen?: boolean
  toggleDropdown?: (studentId: string) => void
  onRelationshipChange?: (studentId: string, relationship: string) => void
}

const StudentItem = ({
  index,
  student,
  isSelected,
  onSelect,
  relationship,
  hasDropdownOpen,
  toggleDropdown,
  onRelationshipChange,
}: StudentItemProps) => {
  const getRelationshipLabel = (relationship: string) => {
    return (
      relationshipOptions.find((opt) => opt.value === relationship)?.label || relationship
    )
  }

  return (
    <TableRow
      key={student.id}
      className={isSelected ? "cursor-pointer bg-blue-50" : "cursor-pointer"}
      onClick={() => onSelect(student, !isSelected)} // clicking row toggles selection
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(student, checked as boolean)}
        />
      </TableCell>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={student.avatar}
              alt={`${student.first_name} ${student.last_name}`}
            />
            <AvatarFallback>
              {getInitials(student.first_name, student.last_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {student.first_name} {student.last_name}
          </span>
        </div>
      </TableCell>
      <TableCell>{student.registration_number}</TableCell>
      {/* <TableCell>{student.class}</TableCell> */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        {isSelected ? (
          <DropdownMenu
            open={hasDropdownOpen}
            onOpenChange={() => toggleDropdown?.(student.id)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-32 justify-between text-sm"
              >
                {getRelationshipLabel(relationship || "father")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {relationshipOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onRelationshipChange?.(student.id, option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
    </TableRow>
  )
}
