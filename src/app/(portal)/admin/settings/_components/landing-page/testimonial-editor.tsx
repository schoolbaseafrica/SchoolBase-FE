"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploaderWithCrop } from "@/components/image-upload/image-uploader-with-crop"
import { Plus, X, Edit2, Save, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Testimonial {
  id: string
  quote: string
  name: string
  role: string
  avatar: string
  order: number
}

interface TestimonialEditorProps {
  testimonials: Testimonial[]
  onAdd: (testimonial: Omit<Testimonial, "id" | "order">) => Promise<void>
  onUpdate: (testimonialId: string, updates: Partial<Testimonial>) => Promise<void>
  onRemove: (testimonialId: string) => Promise<void>
  disabled?: boolean
}

export function TestimonialEditor({
  testimonials,
  onAdd,
  onUpdate,
  onRemove,
  disabled = false,
}: TestimonialEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    quote: "",
    name: "",
    role: "",
    avatar: "",
  })

  const handleAdd = async () => {
    if (!formData.quote || !formData.name || !formData.role) {
      return
    }
    await onAdd(formData)
    setFormData({ quote: "", name: "", role: "", avatar: "" })
    setIsAdding(false)
  }

  const handleUpdate = async (testimonialId: string) => {
    await onUpdate(testimonialId, formData)
    setFormData({ quote: "", name: "", role: "", avatar: "" })
    setEditingId(null)
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      quote: testimonial.quote,
      name: testimonial.name,
      role: testimonial.role,
      avatar: testimonial.avatar,
    })
    setEditingId(testimonial.id)
  }

  const handleCancel = () => {
    setFormData({ quote: "", name: "", role: "", avatar: "" })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Existing Testimonials */}
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(testimonial)}
                  disabled={disabled || editingId === testimonial.id}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(testimonial.id)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {editingId === testimonial.id ? (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`quote-${testimonial.id}`}>Quote</Label>
                <Textarea
                  id={`quote-${testimonial.id}`}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${testimonial.id}`}>Name</Label>
                  <Input
                    id={`name-${testimonial.id}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`role-${testimonial.id}`}>Role</Label>
                  <Input
                    id={`role-${testimonial.id}`}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <ImageUploaderWithCrop
                  currentImageUrl={formData.avatar}
                  onImageUploaded={async (url) => {
                    setFormData({ ...formData, avatar: url })
                  }}
                  aspectRatio={1}
                  cropShape="round"
                  maxFileSizeMB={0.5}
                  label="Upload Avatar"
                  description="1:1 (square), 200x200px recommended"
                  disabled={disabled}
                  showPreview={true}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => handleUpdate(testimonial.id)}
                  disabled={disabled}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={disabled}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-gray-700 italic">&quot;{testimonial.quote}&quot;</p>
            </CardContent>
          )}
        </Card>
      ))}

      <Separator />

      {/* Add New Testimonial */}
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Testimonial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-quote">Quote</Label>
              <Textarea
                id="new-quote"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={3}
                placeholder="Enter testimonial quote..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Person's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Role</Label>
                <Input
                  id="new-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Parent, Student"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              <ImageUploaderWithCrop
                currentImageUrl={formData.avatar}
                onImageUploaded={async (url) => {
                  setFormData({ ...formData, avatar: url })
                }}
                aspectRatio={1}
                cropShape="round"
                maxFileSizeMB={0.5}
                label="Upload Avatar"
                description="1:1 (square), 200x200px recommended"
                disabled={disabled}
                showPreview={true}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAdd}
                disabled={disabled || !formData.quote || !formData.name || !formData.role}
              >
                <Save className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      )}
    </div>
  )
}
