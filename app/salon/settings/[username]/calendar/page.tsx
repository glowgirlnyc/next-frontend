import type { Metadata } from "next"
import { CalendarSettingsPage } from "@/components/settings/CalendarSettingsPage" 

export const metadata: Metadata = {
  title: "Calendar Settings | GlowGirl Salon Admin",
  description: "Manage your salon calendar integration",
}

export default function CalendarPage({ params }: { params: { username: string } }) {
  return <CalendarSettingsPage username={params.username}   />
}

