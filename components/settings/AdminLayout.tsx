"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard, Home, Scissors, Bell, MapPin, Image, Info, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface AdminLayoutProps {
  children: ReactNode
  username: string
}

export function AdminLayout({ children, username }: AdminLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: `/salon/settings/${username}/dashboard`, icon: Home },
    { name: "Bookings", href: `/salon/settings/${username}/bookings`, icon: Calendar },
    { name: "Business Info", href: `/salon/settings/${username}`, icon: Info },
    { name: "Media", href: `/salon/settings/${username}/media`, icon: Image },
    { name: "Services", href: `/salon/settings/${username}/services`, icon: Scissors },
    { name: "Amenities", href: `/salon/settings/${username}/amenities`, icon: Coffee },
    { name: "Calendar", href: `/salon/settings/${username}/calendar`, icon: Calendar },
    { name: "Payments", href: `/salon/settings/${username}/payments`, icon: CreditCard },
    { name: "Notifications", href: `/salon/settings/${username}/notifications`, icon: Bell },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full">
          <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex flex-1 items-center justify-between">
            <Link href={`/salon/settings/${username}/dashboard`} className="flex items-center gap-2">
              <div className="font-bold text-xl">GlowGirl</div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Sarah Adams</p>
                    <p className="text-xs leading-none text-muted-foreground">sarah@glowgirl.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sidebar and Main Content */}
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent className="h-full mt-20">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="p-2 text-xs text-muted-foreground">GlowGirl Salon Admin v1.0</div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="w-full">
              <h1 className="mb-6 text-3xl font-bold tracking-tight">Settings</h1>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

