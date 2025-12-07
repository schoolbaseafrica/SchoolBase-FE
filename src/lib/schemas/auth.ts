import { z } from "zod"

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required")
  .regex(emailRegex, "Enter a valid email address")
  .transform((value) => value.toLowerCase())

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "You need to enter a password"),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

const strongPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters")
  .max(20, "Password must not exceed 20 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[#?!@$%^&*-]/, "Password must contain a special character")

export const resetPasswordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export const userProfileSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  middleName: z.string().trim().max(100).optional(),
  gender: z
    .union([
      z.enum(["MALE", "FEMALE", "OTHER"]),
      z.enum(["Male", "Female", "Other"]),
      z.string(),
    ])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      const upperVal = val.toUpperCase()
      if (["MALE", "FEMALE", "OTHER"].includes(upperVal)) {
        return upperVal as "MALE" | "FEMALE" | "OTHER"
      }
      return null
    }),
  dob: z.string().optional(),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
    .optional(),
  role: z.array(z.string().trim().min(1)).min(1, "Select at least one role").optional(),
  isActive: z.boolean().optional(),
})

export const authTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type SignUpFormValues = z.infer<typeof signUpSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type AuthTokens = z.infer<typeof authTokenSchema>
