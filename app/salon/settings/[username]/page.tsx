import { SalonSettingsPage } from "@/components/settings/SalonSettingsPage"

interface PageProps {
  params: {
    username: string
  }
}

export default function SettingsPage({ params }: PageProps) {
  return <SalonSettingsPage username={params.username} />
}