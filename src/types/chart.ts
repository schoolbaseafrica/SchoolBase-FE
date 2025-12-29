// import type { ChartConfig as ShadcnChartConfig } from "@/components/ui/chart"

// export type TypedChartConfig<T extends string> = Record<
//   T,
//   ShadcnChartConfig[string] & {
//     color: string // enforce color for bars
//   }
// >

export type TypedChartConfig<TKeys extends string> = Record<
  TKeys,
  { label: string; color: string }
>
