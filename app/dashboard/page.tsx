"use client"

import * as React from "react"
import { useEffect } from "react"
import { Bell, ChevronDown, ChevronRight, Filter, MapPin, Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MapView } from "../../components/dashboard/MapView"

interface Salon {
  _id: string;
  salonName: string;
  location: {
    inputLocation: string;
    city: string;
    state: string;
  };
  latitude: number;
  longitude: number;
  services: Array<{
    categoryName: string;
    subServices: Array<{
      title: string;
      price: number;
    }>;
  }>;
  reviews: Array<{
    rating: number;
  }>;
}

const Dashboard = () => {
  const [detailsOpen, setDetailsOpen] = React.useState(true)
  const [searchValue, setSearchValue] = React.useState("")
  const [servicesOpen, setServicesOpen] = React.useState(true)
  const [salons, setSalons] = React.useState<Salon[]>([])
  const [selectedSalon, setSelectedSalon] = React.useState<Salon | null>(null)
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null)

  // Fetch salons on component mount
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/salons')
        const data = await response.json()
        
        setSalons(data)
      } catch (error) {
        console.error('Error fetching salons:', error)
      }
    }

    fetchSalons()

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Filter services based on the salon data
  // const services = React.useMemo(() => {
  //   const uniqueServices = new Set<string>()
  //   salons.forEach(salon => {
  //     salon.services.forEach(service => {
  //       uniqueServices.add(service.categoryName)
  //     })
  //   })
  //   return Array.from(uniqueServices).map(service => ({
  //     id: service.toLowerCase(),
  //     label: service
  //   }))
  // }, [salons])

  // Calculate average rating
  const getAverageRating = (salon: Salon) => {
    if (!salon.reviews || salon.reviews.length === 0) return 0
    const sum = salon.reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / salon.reviews.length).toFixed(1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="absolute top-0 z-30 flex h-16 w-full items-center gap-4 bg-background/95 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-pink-500" />
          <span className="text-xl font-bold">GlowGirl</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">User</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Bookings</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Details Panel with Search and Filters */}
        <div
          className={`absolute left-0 top-16 z-20 h-[calc(100vh-4rem)] w-[380px] bg-background shadow-lg transition-transform duration-300 ${
            detailsOpen ? "translate-x-0" : "-translate-x-[380px]"
          }`}
        >
          <div className="relative h-full overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={() => setDetailsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>

            {/* Search Section */}
            <div className="sticky top-0 z-10 bg-background p-4 pb-2">
              <h2 className="mb-3 text-lg font-semibold">Find Locations</h2>
              <Command className="rounded-lg border shadow-sm">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <CommandInput
                    placeholder="Search locations..."
                    className="h-10 flex-1 border-0 outline-none focus:ring-0"
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                </div>
                {searchValue && (
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Salons">
                      {salons
                        .filter(salon =>
                          salon.salonName.toLowerCase().includes(searchValue.toLowerCase())
                        )
                        .map((salon) => (
                          <CommandItem
                            key={salon._id}
                            onSelect={() => {
                              setSearchValue(salon.salonName)
                              setSelectedSalon(salon)
                            }}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{salon.salonName}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>

            <div className="p-4 pt-2">
              {/* Filters Section */}
              <div className="mb-4 rounded-lg border p-3">
                <div className="mb-2 flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <h3 className="font-medium">Filters</h3>
                </div>

                {/* Services Filter */}
                <Collapsible open={servicesOpen} onOpenChange={setServicesOpen} className="space-y-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-sm font-medium">
                    Services
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-90" : ""}`}
                    />
                  </CollapsibleTrigger>
                  {/* <CollapsibleContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox id={service.id} />
                          <Label htmlFor={service.id} className="text-sm font-normal">
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent> */}
                </Collapsible>
              </div>

              <Separator className="my-4" />

              {/* Selected Location Section */}
              {selectedSalon ? (
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">Selected Location</h3>
                  <h4 className="font-medium">{selectedSalon.salonName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSalon.location.inputLocation}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getAverageRating(selectedSalon)} ★
                  </p>
                </div>
              ) : (
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">Selected Location</h3>
                  <p className="text-sm text-muted-foreground">
                    No location selected yet. Click on the map or search for a place.
                  </p>
                </div>
              )}

              {/* Your Location Section */}
              {userLocation && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <h3 className="font-medium">Your Location</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Current Location</p>
                </div>
              )}

              {/* Nearby Locations Section */}
              <div className="space-y-4">
                <h3 className="font-medium">Nearby Locations</h3>
                {salons.map((salon) => (
                  <div key={salon._id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{salon.salonName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {salon.location.city}, {salon.location.state}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getAverageRating(salon)} ★
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {salon.services.slice(0, 2).map((service, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800"
                            >
                              {service.categoryName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSalon(salon)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button for Details Panel */}
        <Button
          variant="secondary"
          className={`absolute left-4 top-20 z-30 shadow-md ${detailsOpen ? "hidden" : "block"}`}
          onClick={() => setDetailsOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          Search & Filter
        </Button>

        {/* Map Area */}
        <MapView
          selectedSalon={selectedSalon}
          setSelectedSalon={setSelectedSalon}
          salons={salons}
        />
      </div>
    </div>
  )
} 

export default Dashboard;