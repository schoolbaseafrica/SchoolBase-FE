import React from "react"
import Image from "next/image"
import { testimonials } from "@/data/testimonials"

export default function HomeTestimonial() {
  return (
    <section className="w-full bg-[#fafafa] px-4 py-20 text-black md:px-6 lg:px-8">
      <div className="font-outfit mx-auto max-w-[1285px] px-4">
        <div className="mb-12">
          <p className="text-primary mb-4 text-lg font-medium">Testimonials</p>
          <h3
            className="text-text-secondary mb-4 text-base leading-tight font-semibold md:text-2xl"
            // style={{ fontSize: "clamp(28px, 5vw, 40px)" }}
          >
            What Students, Staff & Parents Say About School Base
          </h3>
          <p className="text-primary mx-auto max-w-3xl lg:mx-0">
            Real stories from people who use School Base every day to learn, teach, and
            stay organized
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="rounded-2xl border border-gray-100 bg-[#EEEEEE] p-4 shadow-lg transition-shadow duration-300 md:p-8"
            >
              <TestimonialCard testimonial={testimonial} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0]
  index: number
}) => (
  <div className="flex flex-row gap-6 md:gap-8">
    <div className="shrink-0">
      <div className="relative mx-auto h-40 w-32 overflow-hidden rounded-xl shadow-lg md:mx-0 md:h-56 md:w-56 lg:h-60">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 8rem, 14rem"
          priority={index < 2}
        />
      </div>
    </div>

    <div className="flex flex-1 flex-col gap-4 md:text-left">
      <div className="space-y-2">
        <h3 className="line-clamp-3 text-sm font-semibold text-gray-900 md:text-xl">
          {testimonial.title}
        </h3>

        <p className="line-clamp-4 text-xs leading-none text-gray-700 md:text-base md:leading-relaxed">
          &ldquo;{testimonial.content}&rdquo;
        </p>
      </div>

      <div className="flex items-center justify-items-start gap-4 md:flex">
        {/* <div className="relative h-[31px] w-[31px] overflow-hidden rounded-full shadow lg:hidden">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div> */}

        <div>
          <h4 className="text-primary text-xs font-bold md:text-lg">
            {testimonial.name}
          </h4>
          <p className="text-text-secondary text-xs md:text-sm">{testimonial.role}</p>
        </div>
      </div>
    </div>
  </div>
)
