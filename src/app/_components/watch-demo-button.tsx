"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import DemoVideo from "./demo-video"

type Props = {
  className?: string
}

const WatchDemoButton = ({ className }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [open, setOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)

    const video = videoRef.current
    if (!video) return

    if (isOpen) {
      video.currentTime = 0
      video.play()
    } else {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Watch Demo
        </Button>
      </DialogTrigger>

      <DialogContent className="h-full max-h-[500px] w-full !max-w-[900px] overflow-hidden p-0">
        <div className="w-full">
          <DemoVideo ref={videoRef} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WatchDemoButton
