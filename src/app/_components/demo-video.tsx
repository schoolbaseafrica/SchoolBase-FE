"use client"

import React, { forwardRef } from "react"

type DemoVideoProps = React.ComponentProps<"video">

const DemoVideo = forwardRef<HTMLVideoElement, DemoVideoProps>(({ ...props }, ref) => {
  return (
    <div id="demo-video" className="h-full w-full">
      <video
        ref={ref}
        controls
        autoPlay
        // loop
        preload="metadata"
        {...props}
        className="h-full w-full object-cover"
      >
        <source src="/assets/videos/demo-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
})

DemoVideo.displayName = "DemoVideo"

export default DemoVideo
