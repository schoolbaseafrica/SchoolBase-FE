import React from "react"
import Image from "next/image"

const HomeWhyUs = () => {
  const features = [
    {
      title: "Fees Management",
      description:
        "Track and manage school fees with real-time insights into paid and unpaid amounts.",
      image: "/landing/why1.png",
      alt: "Fees Management Dashboard with Bar Chart",
    },
    {
      title: "Smart Attendance (NFC + QR)",
      description: "Automate attendance tracking with secure, tap-and-go technology.",
      image: "/landing/why2.png",
      alt: "NFC Scanner and Attendance System",
    },
    {
      title: "Integrated Fees & Invoicing",
      description:
        "Streamline tuition payments, generate invoices, and track financials effortlessly.",
      image: "/landing/why3.png",
      alt: "Invoice Dashboard with Pie Chart",
    },
    {
      title: "Parent Mobile App",
      description:
        "Keep parents informed with real-time updates, messaging, and access to records.",
      image: "/landing/why4.png",
      alt: "Parent App Calendar and Notifications",
    },
  ]

  return (
    <section
      id="benefits"
      className="w-full scroll-mt-16 bg-white px-4 pb-16 md:px-6 lg:px-8 lg:pb-24"
    >
      <div className="mx-auto max-w-[1285px] px-4 lg:px-8">
        <div className="mb-12 text-left lg:mb-16">
          <h2
            className="text-3xl leading-tight font-bold text-gray-900 uppercase sm:text-4xl lg:text-5xl"
            style={{ fontSize: "clamp(20px, 4vw, 32px)" }}
          >
            Why You Should Use School Base
          </h2>
          <p
            className="mt-4 max-w-3xl text-left text-lg text-gray-600"
            style={{ fontSize: "clamp(16px, 4vw, 20px)" }}
          >
            It is more than a portal, your school&apos;s digital backbone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col overflow-hidden rounded-2xl bg-[#f9fafc] transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-center pt-8">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={472}
                    height={326}
                    className="w-full max-w-[274px] object-contain sm:max-w-[472px] md:h-[326px] md:max-w-[472px]"
                    priority
                  />
                </div>
              </div>

              <div className="flex-1 p-6 lg:p-8">
                <h3 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeWhyUs
