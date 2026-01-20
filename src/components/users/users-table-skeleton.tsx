"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { UserType } from "@/types/user"

interface UsersTableSkeletonProps {
  userType: UserType
  rows?: number
}

export function UsersTableSkeleton({
  userType,
  rows = 10,
}: UsersTableSkeletonProps) {
  const isTeacher = userType === "teachers"
  const isStudent = userType === "students"
  const isParent = userType === "parents"

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">S/N</TableHead>
            <TableHead>
              {isTeacher ? "Teacher" : isStudent ? "Student" : "Parent"}
            </TableHead>
            {isParent && <TableHead>Email</TableHead>}
            {isParent && <TableHead>Address</TableHead>}
            {!isParent && (
              <TableHead>
                {isTeacher ? "Employee Number" : "Registration Number"}
              </TableHead>
            )}
            {isTeacher && <TableHead>Email</TableHead>}
            {isTeacher && <TableHead>Classes</TableHead>}
            {isStudent && <TableHead>Class</TableHead>}
            {isStudent && <TableHead>Address</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              {isParent && (
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
              )}
              {isParent && (
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              )}
              {!isParent && (
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              )}
              {isTeacher && (
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
              )}
              {isTeacher && (
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              )}
              {isStudent && (
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              )}
              {isStudent && (
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              )}
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
