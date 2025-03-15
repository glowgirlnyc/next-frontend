"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/settings/AdminLayout"
import { MediaCard } from "@/components/settings/MediaCard"
import { useSalon, SalonData } from "@/lib/api/salon"
import { SalonProvider } from "@/components/settings/SalonProvider"
import { toast } from "sonner"

export function MediaSettingsPageContent({ username }: { username: string }) {
  const { salonData, updateSalonField } = useSalon()
  const [pendingFiles, setPendingFiles] = useState<{ logo?: File; images: File[] }>({ images: [] })
  const [previewImages, setPreviewImages] = useState<{
    logo?: { url: string; key: string }
    images?: Array<{ url: string; key: string }>
  }>({})

  useEffect(() => {
    if (salonData) {
      setPreviewImages({})
      setPendingFiles({ images: [] })
    }
  }, [salonData])

  const handleMediaUpdate = (
    newMedia: { logo?: { url: string; key: string }; images?: Array<{ url: string; key: string }> },
    files?: { logo?: File; images?: File[] }
  ) => {
    setPreviewImages((prev) => ({
      ...prev,
      logo: newMedia.logo || prev.logo,
      images: newMedia.images || prev.images,
    }))

    if (files) {
      setPendingFiles((prev) => ({
        logo: files.logo || prev.logo,
        images: files.images ? [...prev.images, ...files.images] : prev.images,
      }))
    }
  }

  const handleSave = async () => {
    const formData = new FormData()

    // Handle logo
    if (pendingFiles.logo && previewImages.logo) {
      formData.append("logo", pendingFiles.logo)
    }

    // Handle images, only append files that match the current previewImages
    if (previewImages.images && previewImages.images.length > 0) {
      const imageIndices = previewImages.images.map((_, i) => i)
      const filteredFiles = pendingFiles.images.filter((_, i) => imageIndices.includes(i))

      filteredFiles.forEach((file, index) => {
        formData.append("images", file)
      })
    }

    // Include existing images to preserve them
    if (salonData?.media?.images?.length) {
      const existingImages = salonData.media.images.filter((img) => img.key)

      if (existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImages))
      }
    }

    try {
      await updateSalonField("media", formData)
      toast.success("Media saved", { description: "Your salon media has been updated successfully." })
    } catch (error) {
      console.error("Error saving media:", error)
      toast.error("Failed to save", { description: "There was an error saving your media." })
    }
  }

  if (!salonData) return <div>Loading...</div>

  const displayData: SalonData = {
    ...salonData,
    media: {
      logo: previewImages.logo || salonData.media?.logo || { url: "/placeholder-logo.svg", key: "" },
      images: previewImages.images || salonData.media?.images || [],
    },
  }

  return (
    <AdminLayout username={username}>
      <div className="flex flex-col gap-6 pb-20">
        <MediaCard
          mediaData={displayData}
          onMediaUpdate={handleMediaUpdate}
          username={username}
          pendingFiles={pendingFiles}
          setPendingFiles={setPendingFiles}
          setPreviewImages={setPreviewImages}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  )
}

export function MediaSettingsPage({ username }: { username: string }) {
  return (
    <SalonProvider username={username}>
      <MediaSettingsPageContent username={username} />
    </SalonProvider>
  )
}