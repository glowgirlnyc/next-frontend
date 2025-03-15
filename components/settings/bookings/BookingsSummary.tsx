import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, CalendarClock, DollarSign, Users } from "lucide-react"

interface BookingsSummaryProps {
  bookings: any[]
}

export function BookingsSummary({ bookings }: BookingsSummaryProps) {
  // Calculate summary statistics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const dailyBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.dateTime)
    return bookingDate.toDateString() === today.toDateString()
  })

  const weeklyBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.dateTime)
    return bookingDate >= weekStart
  })

  const monthlyBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.dateTime)
    return bookingDate >= monthStart
  })

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.dateTime)
    return bookingDate > new Date() && booking.status !== "cancelled"
  })

  const completedBookings = bookings.filter((booking) => booking.status === "completed")
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")
  const checkedInBookings = bookings.filter((booking) => booking.status === "checked-in")
  const noShowBookings = bookings.filter((booking) => booking.status === "no-show")

  // Calculate total earnings
  const totalEarnings = bookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + booking.service.price, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookings.length}</div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div>Today: {dailyBookings.length}</div>
            <div>Week: {weeklyBookings.length}</div>
            <div>Month: {monthlyBookings.length}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Booking Status</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Upcoming: {upcomingBookings.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Completed: {completedBookings.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span>Checked-In: {checkedInBookings.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span>Cancelled: {cancelledBookings.length}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            <span>No-Shows: {noShowBookings.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingBookings.length}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            {upcomingBookings.length > 0 ? (
              <>
                Next: {new Date(upcomingBookings[0].dateTime).toLocaleDateString()} at{" "}
                {new Date(upcomingBookings[0].dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </>
            ) : (
              <>No upcoming appointments</>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            From {completedBookings.length} completed appointments
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

