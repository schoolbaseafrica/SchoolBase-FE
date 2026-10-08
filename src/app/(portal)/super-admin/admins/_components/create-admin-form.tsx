"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { createAdminSchema, CreateAdminValues } from "@/lib/schemas/create-admin.schema"
import { useCreateAdmin } from "../_hooks/use-create-admin"
import { extractErrorMessage } from "@/lib/error-handler"

export function CreateAdminForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      setupSecret: "",
    },
  })

  const { mutate: createAdmin, isPending } = useCreateAdmin()

  function onSubmit(data: CreateAdminValues) {
    createAdmin(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        setupSecret: data.setupSecret,
      },
      {
        onSuccess: () => {
          // Show success toast
          toast.success("First admin invitation sent", {
            description: "The admin can choose a password using the email link.",
            duration: 5000,
          })
          // Clear the form on success
          reset({
            first_name: "",
            last_name: "",
            email: "",
            setupSecret: "",
          })
        },
        onError: (error) => {
          // Show error toast, form data is preserved
          const errorMessage = extractErrorMessage(error)
          toast.error("Failed to create admin account", {
            description: errorMessage || "Please check the form and try again.",
            duration: 5000,
          })
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <FormField
          label="First Name"
          placeholder="Enter first name"
          required={true}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("first_name")}
          error={errors.first_name?.message}
        />
        <FormField
          label="Last Name"
          placeholder="Enter last name"
          required={true}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("last_name")}
          error={errors.last_name?.message}
        />
        <FormField
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          required={true}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("email")}
          error={errors.email?.message}
        />
        <div>
          <FormField
            label="Setup secret"
            type="password"
            placeholder="Enter the temporary secret from Coolify"
            required={true}
            className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
            {...register("setupSecret")}
            error={errors.setupSecret?.message}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="bg-accent hover:bg-accent/90 w-full text-white"
      >
        {isPending ? "Sending..." : "Invite First Admin"}
      </Button>
    </form>
  )
}
