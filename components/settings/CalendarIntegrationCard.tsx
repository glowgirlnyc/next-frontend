"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar, Check, ExternalLink } from "lucide-react"
import { useSalon } from "@/lib/api/salon"

interface CalendarSettings {
  googleConnected: boolean
  googleCalendarId?: string
  syncEnabled: boolean
  notificationsEnabled: boolean
}

const defaultSettings: CalendarSettings = {
  googleConnected: false,
  googleCalendarId: undefined,
  syncEnabled: false,
  notificationsEnabled: false,
}

export function CalendarIntegrationCard() {
  const { salonData, updateSalonField } = useSalon()
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [settings, setSettings] = useState<CalendarSettings>(() => {
    if (salonData?.calendar) {
      return {
        googleConnected: salonData.calendar.googleConnected ?? defaultSettings.googleConnected,
        googleCalendarId: salonData.calendar.googleCalendarId,
        syncEnabled: salonData.calendar.syncEnabled ?? defaultSettings.syncEnabled,
        notificationsEnabled: salonData.calendar.notificationsEnabled ?? defaultSettings.notificationsEnabled,
      }
    }
    return defaultSettings
  })

  if (!salonData) {
    return null
  }

  const handleConnect = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement actual Google Calendar OAuth flow
      const newSettings: CalendarSettings = {
        ...settings,
        googleConnected: true,
        googleCalendarId: "glowgirl.appointments@group.calendar.google.com",
      }
      await updateSalonField('calendar', newSettings)
      setSettings(newSettings)
      toast.success("Google Calendar connected", {
        description: "Your salon is now connected to Google Calendar."
      })
    } catch (error) {
      console.error('Error connecting calendar:', error)
      toast.error("Failed to connect", {
        description: "There was an error connecting to Google Calendar. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = async () => {
    setIsSaving(true)
    try {
      const newSettings: CalendarSettings = {
        ...defaultSettings,
        googleConnected: false,
      }
      await updateSalonField('calendar', newSettings)
      setSettings(newSettings)
      toast.success("Google Calendar disconnected", {
        description: "Your salon is no longer connected to Google Calendar."
      })
    } catch (error) {
      console.error('Error disconnecting calendar:', error)
      toast.error("Failed to disconnect", {
        description: "There was an error disconnecting from Google Calendar. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (JSON.stringify(salonData.calendar) !== JSON.stringify(settings)) {
        await updateSalonField('calendar', settings)
        toast.success("Calendar settings saved", {
          description: "Your calendar integration settings have been updated successfully."
        })
      }
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error("Failed to save", {
        description: "There was an error saving your calendar settings. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSync = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, syncEnabled: enabled }))
    setIsDirty(true)
  }

  const handleToggleNotify = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, notificationsEnabled: enabled }))
    setIsDirty(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Calendar Integration</CardTitle>
        <CardDescription>Connect your salon to Google Calendar to manage appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!settings.googleConnected ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Connect Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Sync your appointments with Google Calendar to manage your schedule more efficiently.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={isSaving}>
              {isSaving ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-muted-foreground">Connected to Google Calendar</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-500">Connected</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="sync-calendar">Two-way Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync appointments between your salon system and Google Calendar
                  </p>
                </div>
                <Switch 
                  id="sync-calendar" 
                  checked={settings.syncEnabled} 
                  onCheckedChange={handleToggleSync}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="calendar-notifications">Calendar Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send appointment reminders through Google Calendar</p>
                </div>
                <Switch 
                  id="calendar-notifications" 
                  checked={settings.notificationsEnabled} 
                  onCheckedChange={handleToggleNotify}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar-id">Calendar ID</Label>
                <div className="flex space-x-2">
                  <Input id="calendar-id" value={settings.googleCalendarId} readOnly />
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open Calendar</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the ID of your Google Calendar where appointments will be synced.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isSaving}>
                Disconnect Calendar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {settings.googleConnected && (
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

