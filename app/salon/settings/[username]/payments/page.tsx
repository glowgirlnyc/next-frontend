import type { Metadata } from "next"
import { PaymentsSettingsPage } from "@/components/settings/PaymentsSettingsPage"   

export const metadata: Metadata = {
  title: "Payment Settings | GlowGirl Salon Admin",
  description: "Manage your salon payment integration",
}

export default function PaymentsPage({ params }: { params: { username: string } }) {
  return <PaymentsSettingsPage username={params.username}   />
}

