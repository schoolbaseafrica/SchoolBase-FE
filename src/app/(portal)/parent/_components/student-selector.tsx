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

  return (
    <Select value={studentID} onValueChange={(value) => setSelectedStudentID(value)}>
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
