"use client"

import React from "react"
import { Clock, ArrowLeft } from "lucide-react"
// import { Button } from "./ui/button"
// import { Input } from "./ui/input"

interface ComingSoonProps {
  pageTitle?: string
  message?: string
  showNotifyButton?: boolean
  onBackClick?: (() => void) | null
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  pageTitle = "Coming Soon",
  message = "We're working hard to bring you this feature. Stay tuned!",
  // showNotifyButton = true,
  onBackClick = null,
}) => {
  // const [email, setEmail] = React.useState<string>("")
  // const [subscribed, setSubscribed] = React.useState<boolean>(false)

  // const handleNotify = () => {
  //   if (!email) alert("Please enter your email address.")

  //   if (email) {
  //     setSubscribed(true)
  //     setTimeout(() => {
  //       setEmail("")
  //       setSubscribed(false)
  //     }, 3000)
  //   }
  // }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-linear-to-b from-gray-50 to-white px-4">
      <div className="animate-onrender w-full max-w-2xl text-center">
        {/* Back Button */}
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-100 opacity-60 blur-2xl"></div>
            <div className="relative rounded-full bg-white p-6 shadow-lg">
              <Clock className="h-10 w-10 text-red-600 lg:h-16 lg:w-16" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-primary mb-4 text-2xl font-bold lg:text-5xl">{pageTitle}</h1>

        {/* Message */}
        <p className="text-baselg:text-xl text-text-secondary mx-auto mb-12 max-w-xl">
          {message}
        </p>

        {/* Notify Form */}
        {/* {showNotifyButton && !subscribed && (
          <div className="mx-auto mb-8 max-w-md">
            <div className="flex flex-col gap-3 lg:flex-row">
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="focus:border-red-500"
                required
              />
              <Button type="button" onClick={handleNotify} className="flex">
                <Bell className="h-5 w-5" />
                Notify Me
              </Button>
            </div>
          </div>
        )} */}

        {/* Success Message */}
        {/* {subscribed && (
          <div className="mx-auto mb-8 max-w-md rounded-full border-2 border-green-200 bg-green-50 px-6 py-3">
            <p className="font-semibold text-green-700">
              ✓ Thanks! We&apos;ll notify you when it&apos;s ready.
            </p>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default ComingSoon
