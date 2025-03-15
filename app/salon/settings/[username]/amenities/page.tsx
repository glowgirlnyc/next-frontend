import type { Metadata } from "next"
import { AmenitiesSettingsPage } from "@/components/settings/AmenitiesSettingsPage"

export const metadata: Metadata = {
  title: "Amenities Settings | GlowGirl Salon Admin",
  description: "Manage your salon amenities",
}

export default function AmenitiesPage({ params }: { params: { username: string } }) {
  return <AmenitiesSettingsPage username={params.username} />
}

