import type { Metadata } from "next"
import { BookingsPage } from "@/components/settings/bookings/BookingsPage"

export const metadata: Metadata = {
  title: "Bookings | GlowGirl Salon Admin",
  description: "Manage and track customer appointments",
}

export default function BookingsPageRoute({ params }: { params: { username: string } }) {
  return <BookingsPage username={params.username} />
}

