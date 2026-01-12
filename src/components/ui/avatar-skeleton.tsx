"use client"

import { cn } from "@/lib/utils"

interface AvatarSkeletonProps {
  className?: string
  size?: number
}

export function AvatarSkeleton({ className, size = 40 }: AvatarSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-400"
      >
        {/* Silhouette shape */}
        <circle cx="50" cy="35" r="18" fill="currentColor" opacity="0.3" />
        <path
          d="M20 85 C20 65, 35 50, 50 50 C65 50, 80 65, 80 85"
          fill="currentColor"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}
