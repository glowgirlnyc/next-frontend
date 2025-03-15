"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/settings/AdminLayout"
import { BookingsSummary } from "@/components/settings/bookings/BookingsSummary"
import { BookingsFilters } from "@/components/settings/bookings/BookingsFilters"
import { BookingsTable } from "@/components/settings/bookings/BookingsTable"        
import { PaymentRecordsSection } from "@/components/settings/bookings/PaymentRecordSection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Printer, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { bookingsData } from "@/components/settings/bookings/BookingsData"

export type BookingStatus = "booked" | "checked-in" | "completed" | "cancelled" | "no-show"
export type DateRangeFilter = "today" | "this-week" | "this-month" | "all-time" | "custom"
export type ServiceTypeFilter = "all" | "manicure" | "pedicure" | "eyebrows" | "eyelashes"

export interface BookingsFiltersState {
  dateRange: DateRangeFilter
  status: BookingStatus | "all"
  serviceType: ServiceTypeFilter
  search: string
  showNoShows: boolean
  startDate: Date | null
  endDate: Date | null
}

export function BookingsPage({ username }: { username: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [bookings, setBookings] = useState(bookingsData)

  const [filters, setFilters] = useState<BookingsFiltersState>({
    dateRange: "this-week",
    status: "all",
    serviceType: "all",
    search: "",
    showNoShows: true,
    startDate: null,
    endDate: null,
  })

  const handleRefresh = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)

    toast("Bookings refreshed", {
      description: "The bookings list has been updated with the latest data.",
    })
  }

  const handleExport = () => {
    toast("Export started", {
      description: "Your bookings data is being exported to CSV.",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleMarkAsCompleted = () => {
    if (selectedBookings.length === 0) return

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        selectedBookings.includes(booking.id) ? { ...booking, status: "completed" as BookingStatus } : booking,
      ),
    )

    toast("Bookings updated", {
      description: "The selected bookings have been marked as completed.",
    })

    setSelectedBookings([])
  }

  const filteredBookings = bookings.filter((booking) => {
    // Filter by status
    if (filters.status !== "all" && booking.status !== filters.status) {
      return false
    }

    // Filter by service type
    if (filters.serviceType !== "all" && booking.service.category.toLowerCase() !== filters.serviceType) {
      return false
    }

    // Filter by no-shows
    if (!filters.showNoShows && booking.status === "no-show") {
      return false
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const clientName = `${booking.client.firstName} ${booking.client.lastName}`.toLowerCase()
      const clientEmail = booking.client.email.toLowerCase()

      if (!clientName.includes(searchTerm) && !clientEmail.includes(searchTerm)) {
        return false
      }
    }

    // Filter by date range
    const bookingDate = new Date(booking.dateTime)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    if (filters.dateRange === "today" && bookingDate.toDateString() !== today.toDateString()) {
      return false
    }

    if (filters.dateRange === "this-week" && bookingDate < weekStart) {
      return false
    }

    if (filters.dateRange === "this-month" && bookingDate < monthStart) {
      return false
    }

    if (filters.dateRange === "custom" && filters.startDate && filters.endDate) {
      if (bookingDate < filters.startDate || bookingDate > filters.endDate) {
        return false
      }
    }

    return true
  })

  // Sort bookings: upcoming first (earliest to latest), then past (latest to earliest)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.dateTime)
    const dateB = new Date(b.dateTime)
    const now = new Date()

    const aIsFuture = dateA > now
    const bIsFuture = dateB > now

    if (aIsFuture && !bIsFuture) return -1
    if (!aIsFuture && bIsFuture) return 1

    if (aIsFuture) {
      // Both are in the future, sort by earliest first
      return dateA.getTime() - dateB.getTime()
    } else {
      // Both are in the past, sort by latest first
      return dateB.getTime() - dateA.getTime()
    }
  })

  return (
    <AdminLayout username={username}>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <BookingsSummary bookings={bookings} />

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payments">Payment Records</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <BookingsFilters
              filters={filters}
              setFilters={setFilters}
              selectedCount={selectedBookings.length}
              onMarkAsCompleted={handleMarkAsCompleted}
            />

            <BookingsTable
              bookings={sortedBookings}
              selectedBookings={selectedBookings}
              setSelectedBookings={setSelectedBookings}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentRecordsSection bookings={bookings} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

