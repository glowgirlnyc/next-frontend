"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import type { BookingStatus } from "./BookingsPage"        
import { Calendar, Clock, MoreHorizontal, User } from "lucide-react"

interface BookingsTableProps {
  bookings: any[]
  selectedBookings: string[]
  setSelectedBookings: (bookings: string[]) => void
}

export function BookingsTable({ bookings, selectedBookings, setSelectedBookings }: BookingsTableProps) {
  const [viewingBooking, setViewingBooking] = useState<any | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(bookings.map((booking) => booking.id))
    } else {
      setSelectedBookings([])
    }
  }

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings([...selectedBookings, bookingId])
    } else {
      setSelectedBookings(selectedBookings.filter((id) => id !== bookingId))
    }
  }

  const handleViewDetails = (booking: any) => {
    setViewingBooking(booking)
  }

  const handleUpdateStatus = (bookingId: string, status: BookingStatus) => {
    // In a real app, this would call an API to update the status
    toast("Status updated", {
      description: `Booking status changed to ${status}.`,
    })
  }

  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case "booked":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      case "checked-in":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
      case "no-show":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
      default:
        return ""
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString)
    const date = dateTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    const time = dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return { date, time }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedBookings.length === bookings.length && bookings.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all bookings"
              />
            </TableHead>
            <TableHead className="w-[200px]">Client</TableHead>
            <TableHead className="w-[200px]">Service</TableHead>
            <TableHead className="w-[180px]">Date & Time</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No bookings found.
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.dateTime)
              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBookings.includes(booking.id)}
                      onCheckedChange={(checked) => handleSelectBooking(booking.id, !!checked)}
                      aria-label={`Select booking for ${booking.client.firstName} ${booking.client.lastName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={booking.client.avatar}
                          alt={`${booking.client.firstName} ${booking.client.lastName}`}
                        />
                        <AvatarFallback>
                          {booking.client.firstName[0]}
                          {booking.client.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {booking.client.firstName} {booking.client.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{booking.client.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.service.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.service.duration}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{date}</div>
                      <div className="text-xs text-muted-foreground">{time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeColor(booking.status)}`} variant="outline">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>${booking.service.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)}>View Details</DropdownMenuItem>
                        {booking.status === "booked" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "checked-in")}>
                            Mark as Checked-In
                          </DropdownMenuItem>
                        )}
                        {(booking.status === "booked" || booking.status === "checked-in") && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "completed")}>
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {booking.status !== "cancelled" && booking.status !== "completed" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "cancelled")}>
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                        {booking.status === "booked" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "no-show")}>
                            Mark as No-Show
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Booking Details Dialog */}
      {viewingBooking && (
        <Dialog open={!!viewingBooking} onOpenChange={() => setViewingBooking(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Appointment information for {viewingBooking.client.firstName} {viewingBooking.client.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={viewingBooking.client.avatar}
                    alt={`${viewingBooking.client.firstName} ${viewingBooking.client.lastName}`}
                  />
                  <AvatarFallback>
                    {viewingBooking.client.firstName[0]}
                    {viewingBooking.client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {viewingBooking.client.firstName} {viewingBooking.client.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{viewingBooking.client.email}</p>
                  <p className="text-sm text-muted-foreground">{viewingBooking.client.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Date</span>
                  </div>
                  <p className="font-medium">
                    {new Date(viewingBooking.dateTime).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Time</span>
                  </div>
                  <p className="font-medium">
                    {new Date(viewingBooking.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Service</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{viewingBooking.service.name}</p>
                    <p className="text-sm text-muted-foreground">Duration: {viewingBooking.service.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${viewingBooking.service.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {viewingBooking.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{viewingBooking.notes}</p>
                </div>
              )}

              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusBadgeColor(viewingBooking.status)}`} variant="outline">
                      {viewingBooking.status.charAt(0).toUpperCase() + viewingBooking.status.slice(1)}
                    </Badge>
                    <span className="text-sm">Current Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(viewingBooking.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setViewingBooking(null)}>
                Close
              </Button>
              <div className="flex gap-2">
                {viewingBooking.status === "booked" && (
                  <Button onClick={() => handleUpdateStatus(viewingBooking.id, "checked-in")}>Check In</Button>
                )}
                {(viewingBooking.status === "booked" || viewingBooking.status === "checked-in") && (
                  <Button onClick={() => handleUpdateStatus(viewingBooking.id, "completed")}>Complete</Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

