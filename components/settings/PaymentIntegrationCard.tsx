"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Check, CreditCard, ExternalLink } from "lucide-react"

export function PaymentIntegrationCard() {
  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [autoPayouts, setAutoPayouts] = useState(true)

  const handleConnect = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSaving(false)
    setIsConnected(true)

    toast("Stripe account connected", {
      description: "Your salon is now connected to Stripe for payments.",
    })
  }

  const handleDisconnect = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setIsConnected(false)

    toast("Stripe account disconnected", {
      description: "Your salon is no longer connected to Stripe.",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)

    toast("Payment settings saved", {
      description: "Your payment integration settings have been updated.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Integration</CardTitle>
        <CardDescription>Connect your Stripe account to receive payments and manage payouts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Connect Stripe Account</h3>
              <p className="text-sm text-muted-foreground">
                Accept payments online and manage your payouts through Stripe.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={isSaving}>
              {isSaving ? "Connecting..." : "Connect Stripe Account"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Stripe</p>
                  <p className="text-sm text-muted-foreground">Connected as GlowGirl Beauty Salon</p>
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
                  <Label htmlFor="auto-payouts">Automatic Payouts</Label>
                  <p className="text-sm text-muted-foreground">Automatically transfer funds to your bank account</p>
                </div>
                <Switch id="auto-payouts" checked={autoPayouts} onCheckedChange={setAutoPayouts} />
              </div>

              {autoPayouts && (
                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">Payout Schedule</Label>
                  <select
                    id="payout-schedule"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly" selected>
                      Weekly (Every Monday)
                    </option>
                    <option value="monthly">Monthly (1st of month)</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="account-id">Stripe Account ID</Label>
                <div className="flex space-x-2">
                  <Input id="account-id" value="acct_1N2p3qRjK4l5M6n7" readOnly />
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open Stripe Dashboard</span>
                  </Button>
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h4 className="text-sm font-medium">Payment Methods Enabled</h4>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Credit Cards
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Apple Pay
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Google Pay
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    ACH Direct Debit
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect Stripe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {isConnected && (
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

