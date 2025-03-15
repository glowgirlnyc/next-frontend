import type { Metadata } from "next"
import { ServicesSettingsPage } from "@/components/settings/ServicesSettingsPage" 

export const metadata: Metadata = {
  title: "Services Settings | GlowGirl Salon Admin",
  description: "Manage your salon services",
}

export default function ServicesPage({ params }: { params: { username: string } }) {
  return <ServicesSettingsPage username={params.username} />
}

