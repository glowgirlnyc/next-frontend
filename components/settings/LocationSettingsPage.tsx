"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AdminLayout } from "@/components/settings/AdminLayout"
import { LocationCard } from "@/components/settings/LocationCard"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function LocationSettingsPage({ username }: { username: string }) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleSaveAll = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSaving(false)
    setLastSaved(new Date())

    toast("Location saved", {
      description: "Your salon location has been updated successfully.",
    })
  }

  return (
    <AdminLayout username={username}>
      <div className="flex flex-col gap-6 pb-20">
        <LocationCard />
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background p-4 md:left-[var(--sidebar-width)] lg:left-[var(--sidebar-width)]">
        <div className="container flex items-center justify-between">
          {lastSaved ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Unsaved changes</div>
          )}
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save all changes"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

