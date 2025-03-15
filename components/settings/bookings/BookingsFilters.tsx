"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, Search, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { BookingsFiltersState, DateRangeFilter, BookingStatus, ServiceTypeFilter } from "./BookingsPage"

interface BookingsFiltersProps {
  filters: BookingsFiltersState
  setFilters: (filters: BookingsFiltersState) => void
  selectedCount: number
  onMarkAsCompleted: () => void
}

export function BookingsFilters({ filters, setFilters, selectedCount, onMarkAsCompleted }: BookingsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search)

  const handleDateRangeChange = (value: string) => {
    setFilters({
      ...filters,
      dateRange: value as DateRangeFilter,
      // Reset custom date range if not using custom
      ...(value !== "custom" && { startDate: null, endDate: null }),
    })
  }

  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value as BookingStatus | "all",
    })
  }

  const handleServiceTypeChange = (value: string) => {
    setFilters({
      ...filters,
      serviceType: value as ServiceTypeFilter,
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({
      ...filters,
      search: searchValue,
    })
  }

  const handleClearSearch = () => {
    setSearchValue("")
    setFilters({
      ...filters,
      search: "",
    })
  }

  const handleNoShowToggle = (checked: boolean) => {
    setFilters({
      ...filters,
      showNoShows: checked,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="grid flex-1 gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 rounded-l-none"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </form>
        </div>

        {selectedCount > 0 && (
          <Button onClick={onMarkAsCompleted}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark {selectedCount} as Completed
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="date-range" className="text-sm whitespace-nowrap">
            Date Range:
          </Label>
          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger id="date-range" className="w-[140px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.dateRange === "custom" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate && filters.endDate ? (
                    <>
                      {format(filters.startDate, "PPP")} - {format(filters.endDate, "PPP")}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.startDate || undefined,
                    to: filters.endDate || undefined,
                  }}
                  onSelect={(range) => {
                    setFilters({
                      ...filters,
                      startDate: range?.from || null,
                      endDate: range?.to || null,
                    })
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Label htmlFor="status" className="text-sm whitespace-nowrap">
            Status:
          </Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status" className="w-[140px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="checked-in">Checked-In</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="service-type" className="text-sm whitespace-nowrap">
            Service:
          </Label>
          <Select value={filters.serviceType} onValueChange={handleServiceTypeChange}>
            <SelectTrigger id="service-type" className="w-[140px]">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="manicure">Manicure</SelectItem>
              <SelectItem value="pedicure">Pedicure</SelectItem>
              <SelectItem value="eyebrows">Eyebrows</SelectItem>
              <SelectItem value="eyelashes">Eyelashes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="show-no-shows" className="text-sm whitespace-nowrap">
            Show No-Shows:
          </Label>
          <Switch id="show-no-shows" checked={filters.showNoShows} onCheckedChange={handleNoShowToggle} />
        </div>
      </div>
    </div>
  )
}

