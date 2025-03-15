"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { useSalon } from "@/lib/api/salon"
import { toast } from "sonner"
import debounce from 'lodash/debounce'

interface LocationAutocompleteProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPlaceSelected: (locationData: LocationData) => void
  disabled: boolean
}

interface Suggestion {
  placePrediction: {
    placeId: string
    text: {
      text: string
    }
  }
}

interface LocationData {
  street: string
  unit: string
  city: string
  state: string
  zip: string
  timezone: string
  placeId: string
  inputLocation: string
  streetNumber: string
  country: string
  latitude: string
  longitude: string
}

interface AddressComponent {
  types: string[]
  shortText: string
}

const LocationAutocomplete = ({ value, onChange, onPlaceSelected, disabled }: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey) {
      setError("API key is missing from environment variables")
      console.error("API Key missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local")
    }
  }, [apiKey])

  const fetchPredictions = async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (!apiKey) {
      setError("API key not available")
      return
    }

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input,
            includedRegionCodes: ['us'],
          }),
        }
      )

      const text = await response.text()

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`)
      }

      const data = JSON.parse(text)

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
        setShowSuggestions(true)
      } else {
        console.warn("No suggestions in response:", data)
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error: unknown) {
      console.error('Error fetching predictions:', error)
      setError(`Failed to fetch suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowSuggestions(false)
    }
  }

  const debouncedFetchPredictions = useCallback(debounce(fetchPredictions, 300), [apiKey])

  const fetchTimezone = async (latitude: string, longitude: string) => {
    if (!latitude || !longitude) {
      console.warn("Latitude or longitude missing for timezone fetch")
      return ''
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${apiKey}`
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`)
      }

      const data = await response.json()

      return data.timeZoneId || ''
    } catch (error: unknown) {
      console.error('Error fetching timezone:', error)
      return ''
    }
  }

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?key=${apiKey}&fields=addressComponents,location,internationalPhoneNumber,utcOffsetMinutes`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`)
      }

      const data = await response.json()
      const address = (data.addressComponents || []) as AddressComponent[]

      const getComponent = (type: string) => {
        const component = address.find((comp: AddressComponent) => comp.types.includes(type))
        const value = component?.shortText || ''

        return value
      }

      const latitude = data.location?.latitude ? String(data.location.latitude) : ''
      const longitude = data.location?.longitude ? String(data.location.longitude) : ''
      const timezone = await fetchTimezone(latitude, longitude)

      const locationData: LocationData = {
        street: `${getComponent('street_number')} ${getComponent('route')}`.trim(),
        unit: getComponent('subpremise'),
        city: getComponent('locality') || getComponent('sublocality'),
        state: getComponent('administrative_area_level_1'),
        zip: getComponent('postal_code'),
        timezone: timezone,
        placeId: placeId,
        inputLocation: `${getComponent('street_number')} ${getComponent('route')}`.trim(),
        streetNumber: getComponent('street_number'),
        country: getComponent('country'),
        latitude: latitude,
        longitude: longitude,
      }

      onPlaceSelected(locationData)
      setShowSuggestions(false)
    } catch (error: unknown) {
      console.error('Error fetching place details:', error)
      setError(`Failed to fetch place details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(e)
    debouncedFetchPredictions(newValue)
  }

  const handleSuggestionClick = (placeId: string, description: string) => {
    const syntheticEvent = {
      target: {
        value: description,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      },
      currentTarget: null,
      nativeEvent: new Event('change'),
      type: 'change',
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      preventDefault: () => {},
      stopPropagation: () => {},
      isPropagationStopped: () => false,
      persist: () => {},
      isDefaultPrevented: () => false,
      timeStamp: Date.now(),
    } as unknown as React.ChangeEvent<HTMLInputElement>
    onChange(syntheticEvent)
    fetchPlaceDetails(placeId)
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id="street"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder="Enter street address"
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.placePrediction.placeId}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                handleSuggestionClick(
                  suggestion.placePrediction.placeId,
                  suggestion.placePrediction.text.text
                )
              }
            >
              {suggestion.placePrediction.text.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function LocationCard() {
  const { salonData, updateSalonField } = useSalon()
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [formData, setFormData] = useState({
    street: salonData?.location?.street || '',
    unit: salonData?.location?.unit || '',
    city: salonData?.location?.city || '',
    state: salonData?.location?.state || '',
    zip: salonData?.location?.zip || '',
    timezone: salonData?.location?.timezone || '',
    placeId: salonData?.location?.placeId || '',
    inputLocation: salonData?.location?.inputLocation || '',
    streetNumber: salonData?.location?.streetNumber || '',
    country: salonData?.location?.country || '',
    latitude: salonData?.location?.latitude || '',
    longitude: salonData?.location?.longitude || '',
  })

  if (!salonData) {
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
  }

  const handlePlaceSelected = (locationData: LocationData) => {
    setFormData({
      street: locationData.street,
      unit: locationData.unit, // Use the API value directly, even if empty
      city: locationData.city,
      state: locationData.state,
      zip: locationData.zip,
      timezone: locationData.timezone,
      placeId: locationData.placeId,
      inputLocation: locationData.inputLocation,
      streetNumber: locationData.streetNumber,
      country: locationData.country,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    })
    setIsDirty(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const locationUpdates = {
        street: formData.street,
        unit: formData.unit,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        timezone: formData.timezone,
        placeId: formData.placeId,
        inputLocation: formData.inputLocation,
        streetNumber: formData.streetNumber,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

      const hasChanges = JSON.stringify(salonData.location) !== JSON.stringify(locationUpdates)

      if (hasChanges) {
        await updateSalonField('location', locationUpdates)
        toast("Location saved", {
          description: "Your location information has been updated successfully."
        })
      }
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error("Failed to save", {
        description: "There was an error saving your location information."
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Location</CardTitle>
        <CardDescription>Update your salon's address and location details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <LocationAutocomplete
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            onPlaceSelected={handlePlaceSelected}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit/Apt Number</Label>
          <Input 
            id="unit" 
            value={formData.unit} 
            onChange={(e) => handleInputChange('unit', e.target.value)}
            disabled={isSaving}
            placeholder="e.g., Apt 4B"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              value={formData.city} 
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input 
              id="state" 
              value={formData.state} 
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input 
              id="zip" 
              value={formData.zip} 
              onChange={(e) => handleInputChange('zip', e.target.value)}
              disabled={isSaving}
            />
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