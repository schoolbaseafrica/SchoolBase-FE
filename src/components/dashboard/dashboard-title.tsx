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
      <h2 className="text-primary pb-3 text-2xl font-bold lg:text-[1.75rem]">
        {heading}
      </h2>
      <p className="text-text-secondary text-sm lg:text-base">{description}</p>
    </section>
  )
}

export default DashboardTitle
