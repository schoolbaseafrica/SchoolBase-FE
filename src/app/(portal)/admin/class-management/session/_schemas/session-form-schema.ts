import * as z from "zod"
import { isDateAfter } from "../_utils/date"

const termSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

export const sessionFormSchema = z
  .object({
    description: z.string().optional(),

    terms: z.object({
      first_term: termSchema,
      second_term: termSchema,
      third_term: termSchema,
    }),

    // acknowledge: z.boolean().refine((v) => v === true, {
    //   message: "You must acknowledge to continue",
    // }),
  })
  .superRefine((data, ctx) => {
    const { first_term, second_term, third_term } = data.terms

    const after = (a: string, b: string) => isDateAfter(a, b)

    // Validate date ordering
    if (!after(first_term.endDate, first_term.startDate))
      ctx.addIssue({
        path: ["terms", "first_term", "endDate"],
        code: z.ZodIssueCode.custom,
        message: "First term end date must be after start date",
      })

    if (!after(second_term.startDate, first_term.endDate))
      ctx.addIssue({
        path: ["terms", "second_term", "startDate"],
        code: z.ZodIssueCode.custom,
        message: "Second term must start after first term ends",
      })

    if (!after(second_term.endDate, second_term.startDate))
      ctx.addIssue({
        path: ["terms", "second_term", "endDate"],
        code: z.ZodIssueCode.custom,
        message: "Second term end date must be after start date",
      })

    if (!after(third_term.startDate, second_term.endDate))
      ctx.addIssue({
        path: ["terms", "third_term", "startDate"],
        code: z.ZodIssueCode.custom,
        message: "Third term must start after second term ends",
      })

    if (!after(third_term.endDate, third_term.startDate))
      ctx.addIssue({
        path: ["terms", "third_term", "endDate"],
        code: z.ZodIssueCode.custom,
        message: "Third term end date must be after start date",
      })
  })

export type SessionFormData = z.infer<typeof sessionFormSchema>
