import { z } from "zod"

export const inviteUserSchema = z.object({
  userType: z.enum(["admin", "teacher"], {
    message: "Please select a user type",
  }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
})

export type InviteUserValues = z.infer<typeof inviteUserSchema>
