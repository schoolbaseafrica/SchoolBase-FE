import { z } from "zod"

export const createAdminSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  setupSecret: z.string().min(32, "Enter the setup secret configured in Coolify"),
})

export type CreateAdminValues = z.infer<typeof createAdminSchema>
