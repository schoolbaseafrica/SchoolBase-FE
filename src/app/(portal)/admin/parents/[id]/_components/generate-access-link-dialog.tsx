"use client"

import { useState } from "react"
import { Copy, Check, Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  const [expiresInHours, setExpiresInHours] = useState<number | null>(null) // null = never expires
  const [isSingleUse, setIsSingleUse] = useState(true)
  const [copied, setCopied] = useState(false)
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false)
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
      setRequiresPasswordReset(response.data.requires_password_reset)
      toast.success("Access link generated", {
        description: "The access link has been created and emailed to the parent.",
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
      setExpiresInHours(null)
      setIsSingleUse(true)
      setCopied(false)
      setRequiresPasswordReset(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
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
                min="0"
                max="8760"
                value={expiresInHours === null ? "" : expiresInHours}
                onChange={(e) => {
                  const value = e.target.value
                  setExpiresInHours(value === "" || value === "0" ? null : Number(value))
                }}
                placeholder="Leave empty for never expires"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty or set to 0 for non-expiring link (default). Max: 8760 hours (1 year)
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
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Email Sent!</AlertTitle>
              <AlertDescription>
                The access link has been emailed to the parent. They can also use the link below.
              </AlertDescription>
            </Alert>
            
            {requiresPasswordReset && (
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Password Reset Required</AlertTitle>
                <AlertDescription className="text-blue-800">
                  The parent will need to set their password before accessing the portal. This will happen automatically when they click the link.
                </AlertDescription>
              </Alert>
            )}

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
                This link {expiresInHours === null ? "never expires" : `expires in ${expiresInHours} hour${expiresInHours !== 1 ? 's' : ''}`}. 
                {isSingleUse ? " It can only be used once." : " It can be used multiple times."}
                {" The parent has also received this link via email."}
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
