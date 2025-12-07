import { z } from "zod"

export const createFeeComponentSchema = z.object({
  component_name: z.string().min(2, "Component name is required"),

  description: z.string().optional(),

  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),

  term_id: z.string().uuid("Invalid term selected"),

  class_ids: z
    .array(z.string().uuid("Invalid class ID"))
    .min(1, "Select at least one class"),
})

export type CreateFeeComponentSchema = z.infer<typeof createFeeComponentSchema>

// import { z } from "zod"

// const classPattern = /^(JSS|SS|jss|ss|js|JS)[0-9A-Z]*$/i

// export const createFeeComponentSchema = z.object({
//   name: z.string().min(2, "Component name is required"),
//   term: z.string().min(1, "Term is required"),

//   classLevels: z
//     .string()
//     .min(1, "At least one class level is required")
//     .refine((value) => {
//       const classes = value.split(",").map((c) => c.trim())
//       return classes.every((c) => classPattern.test(c))
//     }, "Each class must start with JSS or SS and must not include symbols"),

//   amount: z
//     .string()
//     .min(1, "Amount is required")
//     .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
// })

// export type CreateFeeComponentSchema = z.infer<typeof createFeeComponentSchema>
