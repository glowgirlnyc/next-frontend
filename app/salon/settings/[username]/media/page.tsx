import type { Metadata } from "next"
import { MediaSettingsPage } from "@/components/settings/MediaSettingsPage"   

export const metadata: Metadata = {
  title: "Media Settings | GlowGirl Salon Admin",
  description: "Manage your salon media",
}

export default function MediaPage({ params }: { params: { username: string } }) {
  return <MediaSettingsPage username={params.username}  />
}

