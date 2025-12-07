import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { AlertCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { inviteUserSchema, InviteUserValues } from "@/lib/schemas/invite-user.schema"
import { BulkUploadSuccess } from "./bulk-upload-success"
import { useInviteUser } from "../_hooks/use-invite-user"

export function InviteUserForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteUserValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      userType: undefined,
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  const { mutate: inviteUser, isPending } = useInviteUser()

  function onSubmit(data: InviteUserValues) {
    inviteUser(
      {
        email: data.email,
        role: data.userType.toUpperCase(),
        full_name: `${data.firstName} ${data.lastName}`,
      },
      {
        onSuccess: () => setIsSuccess(true),
      }
    )
  }

  if (isSuccess) {
    return (
      <BulkUploadSuccess
        title="Invite sent"
        subtitle="Your Invitation Has Been Processed Successfully"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          User Type <span className="text-red-600">*</span>
        </label>
        <Controller
          control={control}
          name="userType"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="admin"
                  className="text-[#535353] focus:bg-red-50 focus:text-[#DA3743] data-[state=checked]:text-[#DA3743]"
                >
                  Admin
                </SelectItem>
                <SelectItem
                  value="teacher"
                  className="text-[#535353] focus:bg-red-50 focus:text-[#DA3743] data-[state=checked]:text-[#DA3743]"
                >
                  Teacher
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.userType && (
          <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
            <AlertCircleIcon /> {errors.userType.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <FormField
          label="First Name"
          placeholder="Enter first name"
          required={true}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("firstName")}
          error={errors.firstName?.message}
        />
        <FormField
          label="Last Name"
          placeholder="Enter last name"
          required={true}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("lastName")}
          error={errors.lastName?.message}
        />
        <FormField
          label="Email Address"
          placeholder="Enter email address"
          required={true}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("email")}
          error={errors.email?.message}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#DA3743] text-white hover:bg-[#DA3743]/90"
      >
        {isPending ? "Sending..." : "Send Invitation"}
      </Button>
    </form>
  )
}
