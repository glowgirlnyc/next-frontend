"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AdminLayout } from "@/components/settings/AdminLayout"
import { AmenitiesCard } from "@/components/settings/AmenitiesCard"
import { SalonProvider } from "@/components/settings/SalonProvider"

function AmenitiesSettingsPageContent({ username }: { username: string }) {
  return (
    <AdminLayout username={username}>
      <div className="flex flex-col gap-6 pb-20">
        <AmenitiesCard />
      </div>
    </AdminLayout>
  )
}

export function AmenitiesSettingsPage({ username }: { username: string }) {
  return (
    <SalonProvider username={username}>
      <AmenitiesSettingsPageContent username={username} />
    </SalonProvider>
  )
}

