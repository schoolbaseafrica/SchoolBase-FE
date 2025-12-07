"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Submissions",
      value: stats.total,
      description: "All grade submissions",
      // color: "bg-blue-50 border-blue-200",
      color: "border-l-4 border-l-black",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      description: "Awaiting approval",
      // color: "bg-yellow-50 border-yellow-200",
      color: "border-l-4 border-l-yellow-500",
    },
    {
      title: "Approved",
      value: stats.approved,
      description: "Successfully approved",
      // color: "bg-green-50 border-green-200",
      color: "border-l-4 border-l-green-500",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      description: "Returned for revision",
      // color: "bg-red-50 border-red-200",
      color: "border-l-4 border-l-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.color}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
