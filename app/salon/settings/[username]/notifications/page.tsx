import type { Metadata } from "next"
import { NotificationsSettingsPage } from "@/components/settings/NotificationsSettingsPage"   

export const metadata: Metadata = {
  title: "Notification Settings | GlowGirl Salon Admin",
  description: "Manage your salon notification settings",
}

export default function NotificationsPage({ params }: { params: { username: string } }) {
  return <NotificationsSettingsPage username={params.username}  />
}

