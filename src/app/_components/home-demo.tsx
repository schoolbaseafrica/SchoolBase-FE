"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import WatchDemoButton from "./watch-demo-button"

const HomeDemo: React.FC = () => {
  return (
    <section className="font-outfit w-full bg-white py-6 sm:py-8 lg:py-24">
      <div className="flex items-center justify-center lg:hidden">
        <div
          className="md-[349px] h-[249px] w-[229px] overflow-visible md:w-[229px]"
          style={{
            transform: "rotate(0.28deg)",
          }}
        >
          <Image
            src="/demo/demo-mobile.png"
            alt="School Base Dashboard"
            width={500}
            height={550}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </div>
      <div className="mx-auto max-w-[1285px] px-4 py-8 sm:px-6">
        <div className="relative mx-auto h-auto min-h-[210px] w-full overflow-visible rounded-2xl bg-[#DA3743] sm:min-h-[300px] md:h-[319px] md:max-w-[1259px]">
          <div className="absolute inset-0 overflow-hidden rounded-2xl md:block">
            <div className="absolute top-0 right-0 bottom-0 flex w-1/3">
              <div className="relative h-full w-full">
                <div className="absolute top-0 right-0 h-full">
                  <Image
                    src="/demo/Vector 1.png"
                    alt="Wave pattern"
                    width={353}
                    height={334}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute top-0 -right-1 h-full">
                  <Image
                    src="/demo/Vector 2.png"
                    alt="Wave pattern"
                    width={353}
                    height={334}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute top-0 right-1 h-full">
                  <Image
                    src="/demo/Vector 3.png"
                    alt="Wave pattern"
                    width={353}
                    height={334}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden h-full items-center justify-between lg:flex lg:px-16">
            <div className="absolute -top-20 -left-8 lg:-top-32 lg:-left-8">
              <div
                className="h-[450px] w-[400px] overflow-visible"
                style={{
                  transform: "rotate(5.28deg)",
                }}
              >
                <Image
                  src="/demo/demo-mobile.png"
                  alt="School Base Dashboard"
                  width={500}
                  height={550}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="ml-auto max-w-xl text-center text-white md:ml-[120px] lg:ml-[450px]">
              <h5
                className="mb-4 leading-tight font-bold lg:text-4xl"
                style={{ fontSize: "clamp(20px, 4vw, 24px)" }}
              >
                Ready to Modernize Your School
              </h5>
              <p
                className="mb-6 opacity-90 lg:mb-8 lg:text-xl"
                style={{ fontSize: "clamp(16px, 3vw, 18px)" }}
              >
                It&apos;s just getting started
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button
                  asChild
                  className="bg-white text-[#DA3743] transition-colors duration-300 hover:bg-gray-100"
                  style={{ fontSize: "clamp(14px, 3vw, 16px)" }}
                >
                  <Link href="/contact-us">Consult Us</Link>
                </Button>
                <WatchDemoButton className="hover:bg-accent border-white px-6 py-3 text-sm text-white hover:border-white/90" />
              </div>
            </div>
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-8 text-center lg:hidden">
            <div className="max-w-xl text-center text-white lg:ml-[450px]">
              <h5
                className="leading-tight font-medium lg:text-4xl"
                style={{ fontSize: "clamp(20px, 4vw, 24px)" }}
              >
                Ready to Modernize Your School
              </h5>
              <p
                className="mb-6 opacity-90 lg:mb-8 lg:text-xl"
                style={{ fontSize: "clamp(16px, 3vw, 18px)" }}
              >
                It&apos;s just getting started
              </p>
              <div className="flex items-center justify-center gap-1 sm:flex-row sm:gap-2">
                <Button
                  asChild
                  className="bg-white font-semibold whitespace-nowrap text-[#DA3743] transition-colors duration-300 hover:bg-gray-100"
                  style={{ fontSize: "clamp(14px, 3vw, 16px)" }}
                >
                  <Link href="/contact-us">Consult Us</Link>
                </Button>
                <WatchDemoButton className="hover:bg-opacity-10 rounded-md border border-white px-4 py-2 font-semibold whitespace-nowrap text-white transition-colors duration-300 hover:bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeDemo
