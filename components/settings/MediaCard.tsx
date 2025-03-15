"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, Plus } from "lucide-react"
import { useSalon, deleteSalonImage, SalonData } from "@/lib/api/salon"

interface MediaCardProps {
  mediaData: SalonData
  onMediaUpdate: (newMedia: { logo?: { url: string; key: string }; images?: Array<{ url: string; key: string }> }, files?: { logo?: File; images?: File[] }) => void
  username: string
  pendingFiles: { logo?: File; images: File[] }
  setPendingFiles: React.Dispatch<React.SetStateAction<{ logo?: File; images: File[] }>>
  setPreviewImages: React.Dispatch<React.SetStateAction<{ logo?: { url: string; key: string }; images?: Array<{ url: string; key: string }> }>>
  onSave: () => void
}

export function MediaCard({ mediaData, onMediaUpdate, username, pendingFiles, setPendingFiles, setPreviewImages, onSave }: MediaCardProps) {
  const { updateSalonField } = useSalon()
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const currentImages = mediaData.media?.images || []
  const currentLogo = mediaData.media?.logo || { url: "/placeholder-logo.svg", key: "" }

  useEffect(() => {
    setHasUnsavedChanges(!!pendingFiles.logo || pendingFiles.images.length > 0)
  }, [pendingFiles])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onMediaUpdate({ logo: { url: reader.result as string, key: "" } }, { logo: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      const newImagePreviews = files.map((file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        return new Promise<{ url: string; key: string }>((resolve) => {
          reader.onload = () => resolve({ url: reader.result as string, key: "" })
        })
      })
      Promise.all(newImagePreviews).then((previews) => {
        onMediaUpdate({ images: [...currentImages, ...previews] }, { images: files })
      })
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = currentImages[index]

    if (!imageToRemove) return

    const isUnsaved = !imageToRemove.key

    if (isUnsaved) {
      const newImages = currentImages.filter((_, i) => i !== index)
      onMediaUpdate({ images: newImages })

      // Remove the corresponding file from pendingFiles
      const pendingFileIndex = pendingFiles.images.length - (currentImages.length - index)
      setPendingFiles((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== pendingFileIndex),
      }))
      setPreviewImages((prev) => ({ ...prev, images: newImages }))
      toast("Image removed", { description: "The unsaved image has been removed." })
    } else {
      try {
        await deleteSalonImage(username, imageToRemove.key)
        const newImages = currentImages.filter((_, i) => i !== index)
        onMediaUpdate({ images: newImages })
        setPreviewImages((prev) => ({ ...prev, images: newImages }))
        toast("Image removed", { description: "The image has been deleted successfully." })
      } catch (error) {
        console.error("Error removing image:", error)
        toast.error("Failed to remove image", { description: "There was an error deleting the image." })
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>Upload your salon logo, cover photo, and gallery images</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="logo-upload">Salon Logo</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-md border">
              <Image src={currentLogo.url} alt="Salon logo" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" /> Upload new logo
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">Recommended size: 200x200px. Max file size: 2MB.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Gallery Images</Label>
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="images-upload" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" /> Add photos
                <input
                  id="images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImagesUpload}
                />
              </label>
            </Button>
          </div>

          {currentImages.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
              No images uploaded yet. Click "Add photos" to upload gallery images.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {currentImages.map((image, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-md border">
                  <Image src={image.url} alt={`Image ${index + 1}`} fill className="object-cover transition-all group-hover:opacity-80" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}