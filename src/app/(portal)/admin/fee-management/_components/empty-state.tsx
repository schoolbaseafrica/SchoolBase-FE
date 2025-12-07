import React from "react"
import { RiFolderOpenLine } from "react-icons/ri"
import CreateComponentButton from "./create-component-button"

const EmptyState = () => {
  return (
    <section className="flex min-h-[500px] flex-col items-center justify-center gap-6">
      <div className="bg-accent/10 flex h-[140px] w-[140px] items-center justify-center rounded-full">
        <RiFolderOpenLine className="text-accent size-16" />
      </div>
      <div className="space-y-2">
        <h4 className="text-center text-xl font-semibold text-[#101828]">
          Your Fee Will Appear Here
        </h4>
        <p className="text-text-secondary max-w-[55ch] text-center leading-6">
          Get started by creating a new fee to organize your school’s fee structure
        </p>
      </div>

      <CreateComponentButton>Create Your First Fee</CreateComponentButton>
    </section>
  )
}

export default EmptyState
