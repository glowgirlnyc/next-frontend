"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, DollarSign } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface PaymentRecordsSectionProps {
  bookings: any[]
}

export function PaymentRecordsSection({ bookings }: PaymentRecordsSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState("all")

  // Filter completed bookings
  const completedBookings = bookings.filter((booking) => booking.status === "completed")

  // Calculate total earnings
  const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.service.price, 0)

  // Group bookings by month
  const monthlyData = completedBookings.reduce((acc: any, booking) => {
    const date = new Date(booking.dateTime)
    const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`

    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        bookings: 0,
        earnings: 0,
        services: {},
      }
    }

    acc[monthYear].bookings += 1
    acc[monthYear].earnings += booking.service.price

    // Group by service category
    const category = booking.service.category
    if (!acc[monthYear].services[category]) {
      acc[monthYear].services[category] = 0
    }
    acc[monthYear].services[category] += booking.service.price

    return acc
  }, {})

  // Convert to array for display
  const monthlyDataArray = Object.values(monthlyData)

  // Sort by most recent month first
  monthlyDataArray.sort((a: any, b: any) => {
    const dateA = new Date(a.month)
    const dateB = new Date(b.month)
    return dateB.getTime() - dateA.getTime()
  })

  // Prepare chart data
  const chartData = monthlyDataArray
    .map((item: any) => {
      const result: any = {
        name: item.month,
        total: item.earnings,
      }

      // Add service categories
      Object.entries(item.services).forEach(([category, amount]) => {
        result[category] = amount
      })

      return result
    })
    .reverse() // Reverse to show oldest to newest for the chart

  // Get unique service categories for chart
  const serviceCategories = Array.from(new Set(completedBookings.map((booking) => booking.service.category)))

  // Filter bookings by selected month
  const filteredBookings =
    selectedMonth === "all"
      ? completedBookings
      : completedBookings.filter((booking) => {
          const date = new Date(booking.dateTime)
          const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
          return monthYear === selectedMonth
        })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Records</h2>
          <p className="text-muted-foreground">Track your earnings and payment history</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {monthlyDataArray.map((item: any) => (
                <SelectItem key={item.month} value={item.month}>
                  {item.month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {completedBookings.length} completed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedMonth === "all" ? "Monthly Average" : selectedMonth}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {selectedMonth === "all"
                ? (totalEarnings / (monthlyDataArray.length || 1)).toFixed(2)
                : monthlyData[selectedMonth]?.earnings.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth === "all"
                ? `Average across ${monthlyDataArray.length} months`
                : `From ${monthlyData[selectedMonth]?.bookings || 0} appointments`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Service</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {completedBookings.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {(() => {
                    // Calculate top service category
                    const serviceCounts: Record<string, number> = {}
                    filteredBookings.forEach((booking) => {
                      const category = booking.service.category
                      serviceCounts[category] = (serviceCounts[category] || 0) + 1
                    })

                    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]
                    return topService ? topService[0] : "N/A"
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">Most popular service category</p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Earnings Chart</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
              <CardDescription>Breakdown of earnings by service category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
                    <Legend />
                    {serviceCategories.map((category, index) => (
                      <Bar
                        key={category as string}
                        dataKey={category as string}
                        stackId="a"
                        fill={`hsl(${index * 60}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No earnings data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {selectedMonth === "all" ? "All completed appointments" : `Appointments for ${selectedMonth}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{new Date(booking.dateTime).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {booking.client.firstName} {booking.client.lastName}
                        </TableCell>
                        <TableCell>{booking.service.name}</TableCell>
                        <TableCell>{booking.paymentMethod || "Credit Card"}</TableCell>
                        <TableCell className="text-right font-medium">${booking.service.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

