"use client"

import React from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import AddPaymentForm from "./_components/add-payment-form"

const AddPaymentPage = () => {
  return (
    <div className="w-full space-y-8 px-4 py-10 lg:px-8">
      <DashboardTitle
        heading="Add Payment"
        description="Record a new fee payment for a student"
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <AddPaymentForm />
      </div>
    </div>
  )
}

export default AddPaymentPage
