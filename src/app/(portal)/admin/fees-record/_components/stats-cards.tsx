import React from "react"
import { PiMoneyWavyBold } from "react-icons/pi"
import { CheckCircle2, AlertCircle, CreditCard } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | React.ReactNode
  icon: React.ElementType
  iconColor: string
  bgIconColor: string
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  bgIconColor,
}: StatCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${bgIconColor}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-600 sm:text-sm">{title}</span>
      </div>
      <div className="text-primary text-[18px] font-semibold sm:text-3xl">{value}</div>
    </div>
  )
}

import { useFeesAnalytics } from "../_hooks/use-fees-analytics"
import { Skeleton } from "@/components/ui/skeleton"

const StatsCards = () => {
  const { data, isLoading } = useFeesAnalytics()
  const analytics = data?.data?.data

  const stats = [
    {
      title: "Total Expected Fees",
      value: analytics?.totals.total_expected_fees,
      icon: PiMoneyWavyBold,
      iconColor: "text-red-500",
      bgIconColor: "bg-red-50",
      isCurrency: true,
    },
    {
      title: "Total Paid",
      value: analytics?.totals.total_paid,
      icon: CheckCircle2,
      iconColor: "text-green-500",
      bgIconColor: "bg-green-50",
      isCurrency: true,
    },
    {
      title: "Outstanding Balance",
      value: analytics?.totals.outstanding_balance,
      icon: AlertCircle,
      iconColor: "text-orange-500",
      bgIconColor: "bg-orange-50",
      isCurrency: true,
    },
    {
      title: "Transaction This Month",
      value: analytics?.totals.transaction_this_month,
      icon: CreditCard,
      iconColor: "text-emerald-500",
      bgIconColor: "bg-emerald-50",
      isCurrency: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          value={
            isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : stat.isCurrency ? (
              `₦${(stat.value || 0).toLocaleString()}`
            ) : (
              (stat.value || 0).toString()
            )
          }
        />
      ))}
    </div>
  )
}

export default StatsCards
