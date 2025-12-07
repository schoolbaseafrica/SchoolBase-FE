import { AddNewFeeForm } from "../../_components/fee-management/add-new-fee-form-template"

export default function AddNewFeePage() {
  return (
    <div className="bg-neutral-50 p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold">Add New Fee</h1>
        <p className="text-muted-foreground">Create a new fee group for students</p>
      </div>

      <AddNewFeeForm />
    </div>
  )
}
