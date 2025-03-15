"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AdminLayout } from "@/components/settings/AdminLayout"
import { BusinessInfoCard } from "@/components/settings/BusinessInfoCard"
import { LocationCard } from "@/components/settings/LocationCard"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { SalonProvider } from "./SalonProvider"

export function SalonSettingsPage({ username }: { username: string }) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  return (
    <SalonProvider username={username}>
      <AdminLayout username={username}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <BusinessInfoCard />
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
              <div className="text-sm text-muted-foreground">All changes are saved automatically</div>
            )}
          </div>
        </div>
      </AdminLayout>
    </SalonProvider>
  )
}

