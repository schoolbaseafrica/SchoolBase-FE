import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import React from "react"

const HomeAboutSection = () => {
  return (
    <div className="bg-white px-4 py-8 md:gap-8 md:py-12 lg:py-20">
      <div className="container flex flex-col-reverse gap-20 md:grid md:grid-cols-2">
        <section className="grid grid-cols-2 gap-5">
          <Image
            src={"/images/home/about/image1.png"}
            alt=""
            width={"500"}
            height={"800"}
            className="max-h-97 w-full max-w-77 rounded-lg"
          />
          <Image
            src={"/images/home/about/image2.png"}
            alt=""
            width={"500"}
            height={"800"}
            className="mt-25 max-h-97 w-full max-w-77 rounded-lg"
          />
        </section>
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-medium sm:text-2xl lg:text-3xl">About Us</h2>
          <p className="text-2xl text-[#535353]">
            We’re Building a Smarter, Connected School Experience
          </p>
          <p className="text-lg text-[#535353]">
            Open School Portal is a modern school management system that helps schools
            automate tasks, improve communication, and give students, teachers, and
            parents a seamless digital experience. We focus on making everyday school
            operations faster, easier, and more transparent.
          </p>
          <Button asChild className="w-full md:w-fit">
            <Link href={"/about"}>Explore</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}

export default HomeAboutSection
