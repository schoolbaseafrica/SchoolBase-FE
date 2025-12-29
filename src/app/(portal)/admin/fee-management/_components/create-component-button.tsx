"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import CreateComponentDrawer from "./create-component-drawer"

const CreateComponentButton = ({ children }: { children?: React.ReactNode }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 md:w-fit"
      >
        <Plus className="size-4" />
        {children ?? "Create Fee"}
      </Button>

      <CreateComponentDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}

export default CreateComponentButton
