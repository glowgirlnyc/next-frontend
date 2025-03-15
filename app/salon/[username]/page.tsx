import { SalonBookingPage } from "@/components/salon/SalonBookingPage";

export default function SalonPage({ params }: { params: { username: string } }) {       
  return <SalonBookingPage username={params.username} />
}
