"use client"

import { useState } from "react"
import { Copy, Check, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ParentAccessLinksAPI } from "@/lib/api/parent-access-links"
import { useQueryClient } from "@tanstack/react-query"

interface GenerateAccessLinkDialogProps {
  parentId: string
  parentName: string
}

export function GenerateAccessLinkDialog({
  parentId,
  parentName,
}: GenerateAccessLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [expiresInHours, setExpiresInHours] = useState(24)
  const [isSingleUse, setIsSingleUse] = useState(true)
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGeneratedLink(null)

    try {
      const response = await ParentAccessLinksAPI.generate(parentId, {
        expires_in_hours: expiresInHours,
        is_single_use: isSingleUse,
      })

      setGeneratedLink(response.data.link)
      toast.success("Access link generated", {
        description: "The access link has been created successfully.",
      })

      // Invalidate access links list query
      queryClient.invalidateQueries({ queryKey: ["parent-access-links", parentId] })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to generate access link",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success("Copied!", {
        description: "Access link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Error", {
        description: "Failed to copy link",
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setGeneratedLink(null)
      setExpiresInHours(24)
      setIsSingleUse(true)
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          Generate Access Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Access Link for {parentName}</DialogTitle>
          <DialogDescription>
            Create a secure link that allows this parent to access their portal without
            logging in with credentials.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="expires-in-hours">Expiration (hours)</Label>
              <Input
                id="expires-in-hours"
                type="number"
                min="1"
                max="168"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                placeholder="24"
              />
              <p className="text-xs text-muted-foreground">
                Link will expire after this many hours (max: 168 hours / 7 days)
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="single-use">Single-use link</Label>
                <p className="text-xs text-muted-foreground">
                  Link can only be used once (recommended for security)
                </p>
              </div>
              <Switch
                id="single-use"
                checked={isSingleUse}
                onCheckedChange={setIsSingleUse}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Access Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with the parent. {isSingleUse && "It can only be used once."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedLink ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Link"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpen(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
