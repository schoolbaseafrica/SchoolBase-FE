import React from "react"

const DashboardTitle = ({
  heading,
  description,
}: {
  heading: string
  description: string
}) => {
  return (
    <section className="portal-reveal">
      <p className="portal-section-label mb-2">School operations</p>
      <h2 className="text-foreground pb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {heading}
      </h2>
      <p className="text-muted-foreground max-w-2xl text-sm leading-6 lg:text-base">
        {description}
      </p>
    </section>
  )
}

export default DashboardTitle
