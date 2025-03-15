"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, Phone, Plus, Trash2 } from "lucide-react"
import { useSalon } from "@/lib/api/salon"

interface NotificationContact {
  id: number
  value: string
  enabled: boolean
}

interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  emailRecipients: NotificationContact[]
  smsRecipients: NotificationContact[]
}

// Transform legacy contact format to NotificationContact
const transformContact = (contact: any, index: number): NotificationContact => {
  if (typeof contact === 'object' && contact !== null) {
    return {
      id: contact.id || index + 1,
      value: contact.email || contact.phone || contact.value || '',
      enabled: contact.enabled ?? true
    }
  }
  return {
    id: index + 1,
    value: '',
    enabled: true
  }
}

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  emailRecipients: [
    { id: 1, value: "manager@glowgirl.com", enabled: true },
    { id: 2, value: "reception@glowgirl.com", enabled: true },
  ],
  smsRecipients: [{ id: 1, value: "(555) 123-4567", enabled: true }],
}

export function NotificationsCard() {
  const { salonData, updateSalonField } = useSalon()
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (salonData?.notifications) {
      const notifications = salonData.notifications
      return {
        emailEnabled: notifications.emailEnabled ?? defaultSettings.emailEnabled,
        smsEnabled: notifications.smsEnabled ?? defaultSettings.smsEnabled,
        emailRecipients: Array.isArray(notifications.emailRecipients)
          ? notifications.emailRecipients.map(transformContact)
          : defaultSettings.emailRecipients,
        smsRecipients: Array.isArray(notifications.smsRecipients)
          ? notifications.smsRecipients.map(transformContact)
          : defaultSettings.smsRecipients,
      }
    }
    return defaultSettings
  })

  if (!salonData) {
    return null
  }

  const handleAddEmail = () => {
    setSettings(prev => ({
      ...prev,
      emailRecipients: [...prev.emailRecipients, { id: Date.now(), value: "", enabled: true }]
    }))
    setIsDirty(true)
  }

  const handleRemoveEmail = (id: number) => {
    setSettings(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter(email => email.id !== id)
    }))
    setIsDirty(true)
  }

  const handleUpdateEmail = (id: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.map(email => 
        email.id === id ? { ...email, value } : email
      )
    }))
    setIsDirty(true)
  }

  const handleToggleEmail = (id: number, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.map(email => 
        email.id === id ? { ...email, enabled } : email
      )
    }))
    setIsDirty(true)
  }

  const handleAddPhone = () => {
    setSettings(prev => ({
      ...prev,
      smsRecipients: [...prev.smsRecipients, { id: Date.now(), value: "", enabled: true }]
    }))
    setIsDirty(true)
  }

  const handleRemovePhone = (id: number) => {
    setSettings(prev => ({
      ...prev,
      smsRecipients: prev.smsRecipients.filter(phone => phone.id !== id)
    }))
    setIsDirty(true)
  }

  const handleUpdatePhone = (id: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      smsRecipients: prev.smsRecipients.map(phone => 
        phone.id === id ? { ...phone, value } : phone
      )
    }))
    setIsDirty(true)
  }

  const handleTogglePhone = (id: number, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      smsRecipients: prev.smsRecipients.map(phone => 
        phone.id === id ? { ...phone, enabled } : phone
      )
    }))
    setIsDirty(true)
  }

  const handleToggleEmailNotifications = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailEnabled: enabled
    }))
    setIsDirty(true)
  }

  const handleToggleSmsNotifications = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      smsEnabled: enabled
    }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (JSON.stringify(salonData.notifications) !== JSON.stringify(settings)) {
        await updateSalonField('notifications', settings)
        toast.success("Notification settings saved", {
          description: "Your notification preferences have been updated successfully."
        })
      }
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error("Failed to save", {
        description: "There was an error saving your notification settings. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure who receives notifications about bookings and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive booking confirmations and updates via email</p>
              </div>
            </div>
            <Switch 
              id="email-notifications" 
              checked={settings.emailEnabled} 
              onCheckedChange={handleToggleEmailNotifications}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive booking confirmations and updates via SMS</p>
              </div>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={settings.smsEnabled} 
              onCheckedChange={handleToggleSmsNotifications}
              disabled={isSaving}
            />
          </div>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Recipients</TabsTrigger>
            <TabsTrigger value="sms">SMS Recipients</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 pt-4">
            {settings.emailRecipients.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Input
                  value={item.value}
                  onChange={(e) => handleUpdateEmail(item.id, e.target.value)}
                  placeholder="Enter email address"
                  disabled={!settings.emailEnabled || isSaving}
                />
                <Switch
                  checked={item.enabled && settings.emailEnabled}
                  onCheckedChange={(checked) => handleToggleEmail(item.id, checked)}
                  disabled={!settings.emailEnabled || isSaving}
                />
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEmail(item.id)}
                    disabled={!settings.emailEnabled || isSaving}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>
            ))}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddEmail} 
              disabled={!settings.emailEnabled || isSaving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Email
            </Button>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4 pt-4">
            {settings.smsRecipients.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Input
                  value={item.value}
                  onChange={(e) => handleUpdatePhone(item.id, e.target.value)}
                  placeholder="Enter phone number"
                  disabled={!settings.smsEnabled || isSaving}
                />
                <Switch
                  checked={item.enabled && settings.smsEnabled}
                  onCheckedChange={(checked) => handleTogglePhone(item.id, checked)}
                  disabled={!settings.smsEnabled || isSaving}
                />
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePhone(item.id)}
                    disabled={!settings.smsEnabled || isSaving}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>
            ))}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddPhone} 
              disabled={!settings.smsEnabled || isSaving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Phone Number
            </Button>
          </TabsContent>
        </Tabs>

        <div className="rounded-md bg-muted p-4">
          <div className="flex items-start space-x-3">
            <Bell className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Notification Events</h4>
              <p className="text-sm text-muted-foreground">Recipients will be notified about the following events:</p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>New bookings</li>
                <li>Booking cancellations</li>
                <li>Booking modifications</li>
                <li>Appointment reminders (24 hours before)</li>
                <li>Daily schedule summary (morning)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

