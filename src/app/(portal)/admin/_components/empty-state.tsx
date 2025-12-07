import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, LucideIcon } from "lucide-react"
import Image from "next/image"

interface EmptyStateProps {
  title: string
  description: string
  buttonText: string
  buttonHref: string
  buttonOnClick?: () => void
  imageSrc?: string
  imageAlt?: string
  icon?: LucideIcon
}

const EmptyState = ({
  title,
  description,
  buttonText,
  buttonHref,
  buttonOnClick,
  imageSrc = "/assets/images/dashboard/empty-state-hr.svg",
  imageAlt = "Empty state",
  icon: Icon = Plus,
}: EmptyStateProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (buttonOnClick) {
      e.preventDefault()
      buttonOnClick()
    }
  }

  return (
    <section className="flex min-h-[500px] flex-col items-center justify-center gap-6">
      <div className="relative">
        <Image src={imageSrc} alt={imageAlt} width={148} height={148} priority />
      </div>
      <div className="space-y-2">
        <h4 className="text-center text-xl font-semibold text-[#101828]">{title}</h4>
        <p className="text-text-secondary max-w-[55ch] text-center leading-6">
          {description}
        </p>
      </div>
      <Button asChild>
        <Link href={buttonHref} className="flex items-center gap-2" onClick={handleClick}>
          <Icon className="size-4" />
          {buttonText}
        </Link>
      </Button>
    </section>
  )
}

export default EmptyState
