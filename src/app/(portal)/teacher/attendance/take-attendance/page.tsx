import React from "react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const TakeAttendance = () => {
  return (
    <section className="bg-[#fafafa] px-5 pt-10 pb-5">
      {/* info */}
      <h2 className="text-primary pb-4 text-2xl font-bold">Take Attendance: JSS 3A</h2>
      {/* today's date */}
      <p className="w-fit rounded-md border px-4 py-3 shadow-md">
        Today, {new Date().toDateString()}
      </p>

      {/* attendance form */}
      <form>
        <div className="my-10 overflow-hidden rounded-xl border bg-white shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200 hover:bg-gray-200">
                <TableHead className="pl-10">Name</TableHead>
                <TableHead>Morning</TableHead>
                <TableHead>Afternoon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="pl-10">John Doe</TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
                <TableCell className="pl-7">
                  <input type="checkbox" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {/* save button */}
        <div className="flex justify-end">
          {/* show success modal here */}
          <Button>Save Attendance</Button>
        </div>
      </form>
    </section>
  )
}

export default TakeAttendance
