import React from "react"

const DashboardTitle = ({
  heading,
  description,
}: {
  heading: string
  description: string
}) => {
  return (
    <section>
      <h2 className="text-primary text-2xl font-bold">{heading}</h2>
      <p className="text-sm text-[#666666]">{description}</p>
    </section>
  )
}

export default DashboardTitle
