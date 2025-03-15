"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useSalon } from "@/lib/api/salon"

// Sample amenities data
const amenitiesList = [
  { id: "wifi", label: "WiFi", description: "Free WiFi for customers" },
  { id: "parking", label: "Parking", description: "Free or paid parking available" },
  { id: "wheelchair", label: "Wheelchair Accessible", description: "Facilities accessible for wheelchair users" },
  { id: "credit-cards", label: "Credit Cards Accepted", description: "All major credit cards accepted" },
  { id: "online-booking", label: "Online Booking", description: "Customers can book appointments online" },
]

export function AmenitiesCard() {
  const { salonData, updateSalonField } = useSalon()
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const defaultAmenities = ["wifi", "credit-cards", "online-booking"]
    return salonData?.amenities || defaultAmenities
  })

  if (!salonData) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const currentAmenities = salonData.amenities;

      if (JSON.stringify(currentAmenities) !== JSON.stringify(selectedAmenities)) {
        await updateSalonField('amenities', selectedAmenities)
        
        toast.success("Amenities saved", {
          description: "Your salon amenities have been updated successfully."
        })
      }
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error("Failed to save", {
        description: "There was an error saving your amenities. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    setIsDirty(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
        <CardDescription>Select the amenities your salon offers to customers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {amenitiesList.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.id}
                checked={selectedAmenities.includes(amenity.id)}
                onCheckedChange={() => toggleAmenity(amenity.id)}
                disabled={isSaving}
              />
              <Label htmlFor={amenity.id} className="flex cursor-pointer items-center gap-2">
                {amenity.label}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{amenity.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
          ))}
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

