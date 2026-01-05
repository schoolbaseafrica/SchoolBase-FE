"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { createAdminSchema, CreateAdminValues } from "@/lib/schemas/create-admin.schema"
import { CreateAdminSuccess } from "./create-admin-success"
import { useCreateAdmin } from "../_hooks/use-create-admin"

export function CreateAdminForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  const { mutate: createAdmin, isPending } = useCreateAdmin()

  function onSubmit(data: CreateAdminValues) {
    createAdmin(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password || undefined,
      },
      {
        onSuccess: () => setIsSuccess(true),
      }
    )
  }

  if (isSuccess) {
    return (
      <CreateAdminSuccess
        title="Admin Account Created"
        subtitle="The admin account has been created successfully. An email with login credentials has been sent to the admin's email address."
      />
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
        <FormField
          label="Phone Number"
          type="tel"
          placeholder="Enter phone number (optional)"
          required={false}
          className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <div>
          <FormField
            label="Password"
            type="password"
            placeholder="Enter password (optional - will be auto-generated if not provided)"
            required={false}
            className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
            {...register("password")}
            error={errors.password?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            If no password is provided, a secure random password will be generated and sent via email.
          </p>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="bg-accent hover:bg-accent/90 w-full text-white"
      >
        {isPending ? "Creating..." : "Create Admin Account"}
      </Button>
    </form>
  )
}

