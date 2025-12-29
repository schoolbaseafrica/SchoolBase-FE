import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useParentStudents } from "./student-provider"
import { cn } from "@/lib/utils"

export const StudentSelector = ({ className }: { className?: string }) => {
  const { students: studentsData, studentID, setSelectedStudentID } = useParentStudents()

  // Ensure value is always a defined string to avoid uncontrolled/controlled warning
  // If studentID is undefined, use empty string (Select will show placeholder)
  const selectValue = studentID || ""

  return (
    <Select
      value={selectValue}
      onValueChange={(value) => setSelectedStudentID(value)}
      disabled={studentsData.length === 0}
    >
      <SelectTrigger className={cn("border-accent text-accent w-30", className)}>
        <SelectValue placeholder="Select Student" />
      </SelectTrigger>
      <SelectContent>
        {studentsData.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
