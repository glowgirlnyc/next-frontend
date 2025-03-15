"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSalon, SalonData } from "@/lib/api/salon"
import { toast } from "sonner"

// Validation functions
const isValidEmail = (email: string) => {
  return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const isValidPhone = (phone: string) => {
  const digitsOnly = phone.replace(/\D/g, '')
  return phone === '' || /^\d{10}$/.test(digitsOnly)
}

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value: string) => {
  if (!value) return value
  const phoneNumber = value.replace(/\D/g, '')
  const phoneNumberLength = phoneNumber.length

  if (phoneNumberLength < 4) return phoneNumber
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
}

// Remove formatting from phone number
const unformatPhoneNumber = (value: string) => {
  return value.replace(/\D/g, '')
}

// Social media URL constants
const SOCIAL_URLS = {
  instagram: 'https://www.instagram.com/',
  twitter: 'https://twitter.com/',
  facebook: 'https://facebook.com/'
}

// Helper function to extract username from social media URL
const extractSocialUsername = (url: string, platform: keyof typeof SOCIAL_URLS) => {
  if (!url) return ''
  return url.replace(SOCIAL_URLS[platform], '').replace(/\/$/, '')
}

// Helper function to format social media URL
const formatSocialUrl = (username: string, platform: keyof typeof SOCIAL_URLS) => {
  if (!username) return ''
  const cleanUsername = username.replace(/^[@/]+/, '').replace(/\/$/, '')
  return cleanUsername ? `${SOCIAL_URLS[platform]}${cleanUsername}` : ''
}

export function BusinessInfoCard() {
  const { salonData, updateSalonField } = useSalon()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<SalonData>(salonData || {
    username: '',
    salonName: '',
    about: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    socials: {
      instagram: '',
      facebook: '',
      twitter: ''
    }
  } as SalonData)
  const [displayPhone, setDisplayPhone] = useState(formatPhoneNumber(formData.contactPhone || ''))
  const [isDirty, setIsDirty] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({})

  if (!salonData) {
    return null
  }

  const handleInputChange = (field: keyof SalonData | 'socials.instagram' | 'socials.twitter' | 'socials.facebook', value: string) => {
    // Clear validation errors when user starts typing
    if (field === 'contactEmail') {
      setValidationErrors(prev => ({ ...prev, email: undefined }))
    }
    if (field === 'contactPhone') {
      setValidationErrors(prev => ({ ...prev, phone: undefined }))
      // Format phone for display but store raw digits
      const rawPhone = unformatPhoneNumber(value)
      setDisplayPhone(formatPhoneNumber(rawPhone))
      value = rawPhone // Store raw digits in formData
    }

    setFormData((prev: SalonData) => {
      // Handle nested fields for social media
      if (field.includes('.')) {
        const [parent, child] = field.split('.') as [keyof SalonData, keyof typeof SOCIAL_URLS]
        if (parent === 'socials') {
          // Format the social media URL when user inputs username
          const formattedUrl = formatSocialUrl(value, child)
          return {
            ...prev,
            socials: {
              ...prev.socials,
              [child]: formattedUrl
            }
          }
        }
      }
      return { ...prev, [field]: value } as SalonData
    })
    setIsDirty(true)
  }

  const validateForm = (): boolean => {
    const errors: { email?: string; phone?: string } = {}

    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      errors.email = "Please enter a valid email address"
    }

    if (formData.contactPhone && !isValidPhone(formData.contactPhone)) {
      errors.phone = "Please enter a valid 10-digit phone number"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors before saving."
      })
      return
    }

    setIsSaving(true)

    try {
      const updates: Partial<SalonData> = {}

      Object.entries(formData).forEach(([key, value]) => {
        const typedKey = key as keyof SalonData;
        
        if (JSON.stringify(salonData[typedKey]) !== JSON.stringify(value)) {
          updates[typedKey] = value
        }
      })

      if (Object.keys(updates).length > 0) {
        const firstKey = Object.keys(updates)[0] as keyof SalonData
        await updateSalonField(firstKey, updates[firstKey])
        toast.success("Business information saved", {
          description: "Your business information has been updated successfully."
        })
      }

      setIsDirty(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error("Failed to save", {
        description: "There was an error saving your business information. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Extract usernames from URLs for display in inputs
  const socialUsernames = {
    instagram: extractSocialUsername(formData.socials?.instagram || '', 'instagram'),
    twitter: extractSocialUsername(formData.socials?.twitter || '', 'twitter'),
    facebook: extractSocialUsername(formData.socials?.facebook || '', 'facebook')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Update your salon's basic information and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salonName">Salon Name</Label>
          <Input 
            id="salonName" 
            value={formData.salonName} 
            onChange={(e) => handleInputChange('salonName', e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={formData.username} disabled />
          <p className="text-xs text-muted-foreground">This will be used for your salon's URL: glowgirl.com/salon/{formData.username}. Please <a href="mailto:team@glowgirlnyc.com" className="underline">contact us</a> if you would like to change it.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">Business Description</Label>
          <Textarea
            id="about"
            rows={4}
            value={formData.about || ''}
            onChange={(e) => handleInputChange('about', e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Public Contact Email</Label>
            <Input 
              id="contactEmail" 
              type="email" 
              value={formData.contactEmail || ''} 
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              disabled={isSaving}
              aria-invalid={!!validationErrors.email}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Public Contact Phone</Label>
            <Input 
              id="contactPhone" 
              type="tel" 
              value={displayPhone} 
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              disabled={isSaving}
              aria-invalid={!!validationErrors.phone}
              placeholder="(XXX) XXX-XXXX"
            />
            {validationErrors.phone && (
              <p className="text-sm text-destructive">{validationErrors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input 
              id="website" 
              type="url" 
              value={formData.website || ''} 
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Username</Label>
            <Input 
              id="instagram" 
              value={socialUsernames.instagram} 
              onChange={(e) => handleInputChange('socials.instagram', e.target.value)}
              disabled={isSaving}
              placeholder="username"
              prefix={SOCIAL_URLS.instagram}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Username</Label>
            <Input 
              id="twitter" 
              value={socialUsernames.twitter} 
              onChange={(e) => handleInputChange('socials.twitter', e.target.value)}
              disabled={isSaving}
              placeholder="username"
              prefix={SOCIAL_URLS.twitter}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook Username</Label>
            <Input 
              id="facebook" 
              value={socialUsernames.facebook} 
              onChange={(e) => handleInputChange('socials.facebook', e.target.value)}
              disabled={isSaving}
              placeholder="username"
              prefix={SOCIAL_URLS.facebook}
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

