"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AdminLayout } from "@/components/settings/AdminLayout"
import { ServicesCard } from "@/components/settings/ServicesCard"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { SalonProvider } from "@/components/settings/SalonProvider"

function ServicesSettingsPageContent({ username }: { username: string }) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement actual save all functionality if needed
      setLastSaved(new Date())
      toast("Services saved", {
        description: "Your salon services have been updated successfully.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout username={username}>   
      <div className="flex flex-col gap-6 pb-20">
        <ServicesCard />
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

export function ServicesSettingsPage({ username }: { username: string }) {
  return (
    <SalonProvider username={username}>
      <ServicesSettingsPageContent username={username} />
    </SalonProvider>
  )
}

