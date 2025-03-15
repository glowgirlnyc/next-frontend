"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import Image from "next/image"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Facebook,
  Heart,
  Instagram,
  MapPin,
  Phone,
  Share2,
  Star,
  InstagramIcon as TiktokIcon,
  Wifi,
  ShipWheelIcon as Wheelchair,
  Wind,
  Coffee,
  Car,
  Mail,
  Globe,
  ChevronDown,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Review {
  id?: string;
  rating: number;
  reviewText: string;
  name?: string;
  avatar?: string;
  date?: string;
  service?: string;
  photos?: string[];
  text?: string; // For backward compatibility
}

interface SalonData {
  _id: string;
  salonName: string;
  username: string;
  headline?: string;
  about?: string;
  location: {
    inputLocation: string;
    city: string;
    state: string;
    zip: string;
  };
  phones: string[];
  emails: string[];
  website?: string;
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  services: Array<{
    categoryName: string;
    subServices: Array<{
      title: string;
      description: string;
      price: number;
      duration: number;
    }>;
  }>;
  images: Array<{
    url: string;
    key: string;
  }>;
  reviews: Review[];
}

const serviceCategories = [
  {
    id: "manicure",
    name: "Manicure Services",
    image: "/placeholder.svg?height=300&width=500&text=Manicure",
    description: "Professional nail care for beautiful, healthy hands",
    services: [
      { id: "m1", name: "Classic Manicure", duration: "30 min", price: 35, description: "Nail shaping, cuticle care, hand massage, and polish" },
      { id: "m2", name: "Gel Manicure", duration: "45 min", price: 45, description: "Long-lasting gel polish with nail prep and cuticle care" },
      { id: "m3", name: "Luxury Manicure", duration: "60 min", price: 55, description: "Classic manicure plus exfoliation, mask, and extended massage" },
      { id: "m4", name: "Nail Art", duration: "15-45 min", price: "15-45", description: "Custom nail designs from simple to elaborate" },
    ]
  },
  {
    id: "pedicure",
    name: "Pedicure Services",
    image: "/placeholder.svg?height=300&width=500&text=Pedicure",
    description: "Relaxing foot treatments for healthy, beautiful feet",
    services: [
      { id: "p1", name: "Classic Pedicure", duration: "45 min", price: 45, description: "Foot soak, nail care, callus removal, and polish" },
      { id: "p2", name: "Gel Pedicure", duration: "60 min", price: 55, description: "Classic pedicure with long-lasting gel polish" },
      { id: "p3", name: "Luxury Pedicure", duration: "75 min", price: 65, description: "Premium pedicure with extended massage and paraffin treatment" },
      { id: "p4", name: "Express Pedicure", duration: "30 min", price: 35, description: "Quick refresh for your feet with essential care" },
    ]
  },
  {
    id: "eyelash",
    name: "Eyelash Services",
    image: "/placeholder.svg?height=300&width=500&text=Eyelash",
    description: "Enhance your natural beauty with our eyelash treatments",
    services: [
      { id: "e1", name: "Classic Lash Extensions", duration: "90 min", price: 120, description: "One extension applied to each natural lash" },
      { id: "e2", name: "Volume Lash Extensions", duration: "120 min", price: 150, description: "Multiple extensions per natural lash for fuller look" },
      { id: "e3", name: "Lash Lift & Tint", duration: "60 min", price: 85, description: "Curls and darkens your natural lashes" },
      { id: "e4", name: "Lash Extension Fill", duration: "60 min", price: 75, description: "Maintenance for existing lash extensions" },
    ]
  },
  {
    id: "eyebrow",
    name: "Eyebrow Services",
    image: "/placeholder.svg?height=300&width=500&text=Eyebrow",
    description: "Frame your face with perfectly shaped brows",
    services: [
      { id: "b1", name: "Eyebrow Waxing", duration: "15 min", price: 20, description: "Shape and define brows with precision waxing" },
      { id: "b2", name: "Eyebrow Tinting", duration: "20 min", price: 25, description: "Semi-permanent color for fuller-looking brows" },
      { id: "b3", name: "Brow Lamination", duration: "45 min", price: 70, description: "Restructures brow hairs for a fuller, more uniform look" },
      { id: "b4", name: "Microblading Consultation", duration: "30 min", price: 0, description: "Free consultation for semi-permanent eyebrow tattooing" },
    ]
  }
]

const images = [
  "/placeholder.svg?height=600&width=1200&text=Salon+Interior",
  "/placeholder.svg?height=600&width=1200&text=Styling+Area",
  "/placeholder.svg?height=600&width=1200&text=Nail+Services",
  "/placeholder.svg?height=600&width=1200&text=Reception",
]



interface SalonBookingPageProps {
  username: string;
}

export function SalonBookingPage({ username }: SalonBookingPageProps) {
  const [salonData, setSalonData] = useState<SalonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState("about")
  const [date, setDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [isNavSticky, setIsNavSticky] = useState(false)
  
  const navRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLElement>(null)
  const reviewsRef = useRef<HTMLElement>(null)
  const locationRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/salons/username/${username}`)

        setSalonData(response.data)
        setError(null)
      } catch (err) {
        setError('Failed to load salon data. Please try again later.')
        console.error('Error fetching salon data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchSalonData()
    }
  }, [username])

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const navPosition = navRef.current.getBoundingClientRect().top
        setIsNavSticky(navPosition <= 0)
      }

      const scrollPosition = window.scrollY + 100
      const sections = {
        about: aboutRef.current,
        services: servicesRef.current,
        reviews: reviewsRef.current,
        location: locationRef.current
      }

      for (const [section, element] of Object.entries(sections)) {
        if (element) {
          const top = element.offsetTop
          const bottom = top + element.offsetHeight

          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveTab(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f9] p-8">
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf8f9] p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!salonData) {
    return (
      <div className="min-h-screen bg-[#fdf8f9] p-8">
        <Alert>
          <AlertDescription>Salon not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Use salonData.images instead of hardcoded images
  // const images = salonData.images.length > 0 
  //   ? salonData.images.map(img => img.url)
  //   : ["/placeholder.svg?height=600&width=1200&text=Salon+Interior"]

  // Business hours (you might want to add this to your salon model)
  const businessHours = [
    { day: "Monday", hours: "9:00 AM - 7:00 PM" },
    { day: "Tuesday", hours: "9:00 AM - 7:00 PM" },
    { day: "Wednesday", hours: "9:00 AM - 7:00 PM" },
    { day: "Thursday", hours: "9:00 AM - 8:00 PM" },
    { day: "Friday", hours: "9:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "10:00 AM - 5:00 PM" },
  ]

  // Transform the services data from the backend format to the frontend format
  // const serviceCategories = salonData.services.map(category => ({
  //   id: category.categoryName.toLowerCase(),
  //   name: `${category.categoryName} Services`,
  //   image: `/placeholder.svg?height=300&width=500&text=${category.categoryName}`,
  //   description: `Professional ${category.categoryName.toLowerCase()} services`,
  //   services: category.subServices.map((service, index) => ({
  //     id: `${category.categoryName.toLowerCase()}_${index}`,
  //     name: service.title,
  //     duration: `${service.duration} min`,
  //     price: service.price,
  //     description: service.description
  //   }))
  // }))

  // Calculate review stats if reviews exist
  const reviews = salonData.reviews || []
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++
  })
  const ratingPercentages = ratingCounts.map(count => 
    reviews.length > 0 ? (count / reviews.length) * 100 : 0
  )

  // Time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM"
  ]

  // Handle carousel
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  //   }, 5000)
  //   return () => clearInterval(interval)
  // }, [images.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Handle service selection
  const toggleServiceSelection = (service: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id)
      if (isSelected) {
        return prev.filter(s => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }

  // Calculate total price
  const totalPrice = selectedServices.reduce((total, service) => {
    const price = typeof service.price === 'number' ? service.price : Number.parseInt(service.price.split('-')[0])
    return total + price
  }, 0)

  // In the reviews section, handle optional fields
  const renderReview = (review: Review) => (
    <div key={review.id || Math.random().toString()} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-4 mb-3">
        <Image
          src={review.avatar || "/placeholder.svg?text=User"}
          alt={review.name || "Anonymous"}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1">
          <h4 className="font-medium">{review.name || "Anonymous"}</h4>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            {review.date && (
              <span className="text-sm text-gray-600">
                {format(new Date(review.date), "PP")}
              </span>
            )}
          </div>
          {review.service && (
            <div className="text-sm text-gray-600 mb-2">Service: {review.service}</div>
          )}
          <p className="text-gray-700">{review.text || review.reviewText}</p>
          
          {review.photos && review.photos.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.photos.map((photo, index) => (
                <Image
                  key={index}
                  src={photo || "/placeholder.svg"}
                  alt={`Review photo ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf8f9]">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative h-full w-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={"/placeholder.svg?text=User"}
                alt={`Salon image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Salon Name and Rating */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-10">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Serenity Beauty & Nail Spa</h1>
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white ml-2">5.0 (128 reviews)</span>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white">
                Book Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20">
                <Heart className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div 
        ref={navRef} 
        className={cn(
          "bg-white border-b border-gray-200 transition-all duration-300",
          isNavSticky ? "sticky top-0 z-30 shadow-md" : ""
        )}
      >
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-16 bg-transparent border-b p-0 space-x-8">
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none h-full px-1"
                onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                About
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none h-full px-1"
                onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Services
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none h-full px-1"
                onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none h-full px-1"
                onClick={() => locationRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Location
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {/* About Section */}
            <section 
              id="about" 
              className="mb-12" 
              ref={aboutRef}
            >
              <h2 className="text-2xl font-bold mb-6">About Serenity Beauty & Nail Spa</h2>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <p className="text-gray-700 mb-6">
                  Welcome to Serenity Beauty & Nail Spa, where beauty meets relaxation. Our salon offers a tranquil escape from the hustle and bustle of everyday life, providing premium beauty services in a luxurious environment. With our team of skilled professionals, state-of-the-art equipment, and premium products, we ensure that every client leaves feeling refreshed, beautiful, and confident.
                </p>
                <p className="text-gray-700 mb-6">
                  Founded in 2015, our salon has quickly become a favorite destination for those seeking exceptional beauty services. We pride ourselves on our attention to detail, commitment to hygiene, and personalized approach to each client's needs. Whether you're looking for a quick manicure or a complete beauty transformation, we're here to exceed your expectations.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {businessHours.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">{item.day}</span>
                      <span className="text-gray-600">{item.hours}</span>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-pink-600 mr-3" />
                    <a href="tel:+15551234567" className="text-gray-700 hover:text-pink-600 transition-colors">
                      (555) 123-4567
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-pink-600 mr-3" />
                    <a href="mailto:info@serenityspa.com" className="text-gray-700 hover:text-pink-600 transition-colors">
                      info@serenityspa.com
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-pink-600 mr-3" />
                    <a href="https://www.serenityspa.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-600 transition-colors">
                      www.serenityspa.com
                    </a>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4 mb-6">
                  <a href="#" className="bg-pink-100 p-3 rounded-full text-pink-600 hover:bg-pink-200 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="bg-pink-100 p-3 rounded-full text-pink-600 hover:bg-pink-200 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="bg-pink-100 p-3 rounded-full text-pink-600 hover:bg-pink-200 transition-colors">
                    <TiktokIcon className="h-5 w-5" />
                  </a>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-gray-700">Free WiFi</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-gray-700">Parking Available</span>
                  </div>
                  <div className="flex items-center">
                    <Wheelchair className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-gray-700">Wheelchair Access</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-gray-700">Credit Cards Accepted</span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-gray-700">Air Conditioning</span>
                  </div>
                  <div className="flex items-center">
                    <Coffee className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-gray-700">Complimentary Drinks</span>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Services Section */}
            <section 
              id="services" 
              className="mb-12" 
              ref={servicesRef}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Our Services</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Price Range:</span>
                  <Badge variant="outline" className="font-normal">$$ - $$$</Badge>
                </div>
              </div>
              
              <div className="space-y-6">
                {serviceCategories.map((category) => (
                  <Collapsible key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="flex w-full p-0">
                      <div className="relative w-full">
                        <div className="aspect-[3/1] relative">
                          <Image
                            src={category.image || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        </div>
                        <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full flex justify-between items-end">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{category.name}</h3>
                            <p className="text-white/90 text-sm md:text-base">{category.description}</p>
                          </div>
                          <ChevronDown className="h-6 w-6 text-white transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 md:p-6 space-y-4">
                        {category.services.map((service) => (
                          <div key={service.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <h4 className="text-lg font-semibold">{service.name}</h4>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{service.duration}</span>
                                </div>
                                <div className="font-medium">${service.price}</div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{service.description}</p>
                            <Button 
                              variant={selectedServices.some(s => s.id === service.id) ? "default" : "outline"} 
                              size="sm"
                              className={selectedServices.some(s => s.id === service.id) ? "bg-pink-600 hover:bg-pink-700 text-white" : ""}
                              onClick={() => toggleServiceSelection(service)}
                            >
                              {selectedServices.some(s => s.id === service.id) ? "Selected" : "Book Now"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
              
              {/* Special Offers */}
              <div className="mt-8 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-800">Special Offers & Packages</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pamper Package</CardTitle>
                      <CardDescription>Manicure, Pedicure & Facial</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">3 hours</span>
                        <span className="font-medium">$150</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Save $35 with this package deal</p>
                      <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700">Book Package</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">First-Time Client Special</CardTitle>
                      <CardDescription>Any service of your choice</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Varies</span>
                        <span className="font-medium">15% Off</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">New clients only, mention when booking</p>
                      <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700">Book Now</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
            
            {/* Reviews Section */}
            <section 
              id="reviews" 
              className="mb-12" 
              ref={reviewsRef}
            >
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                {/* Rating Summary */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="text-center md:border-r md:pr-6 md:w-1/4">
                    <div className="text-5xl font-bold text-pink-600 mb-2">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <p className="text-gray-600">{reviews.length} reviews</p>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">Rating Breakdown</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <div className="w-16 text-sm">{rating} stars</div>
                          <div className="flex-1 mx-3">
                            <Progress value={ratingPercentages[rating - 1]} className="h-2" />
                          </div>
                          <div className="w-12 text-sm text-right">{ratingCounts[rating - 1]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Filter Options */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="manicure">Manicure</SelectItem>
                      <SelectItem value="pedicure">Pedicure</SelectItem>
                      <SelectItem value="eyelash">Eyelash</SelectItem>
                      <SelectItem value="eyebrow">Eyebrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Review List */}
                <div className="space-y-6">
                  {reviews.map(renderReview)}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-pink-600 text-white hover:bg-pink-700">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Location Section */}
            <section 
              id="location" 
              className="mb-12" 
              ref={locationRef}
            >
              <h2 className="text-2xl font-bold mb-6">Location & Hours</h2>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                {/* Map */}
                <div className="aspect-video relative">
                  <Image
                    src="/placeholder.svg?height=400&width=800&text=Google+Maps"
                    alt="Salon location map"
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="md:w-1/2">
                      <h3 className="text-xl font-semibold mb-3">Address</h3>
                      <div className="flex items-start mb-4">
                        <MapPin className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-800">123 Beauty Boulevard</p>
                          <p className="text-gray-800">Suite 200</p>
                          <p className="text-gray-800">New York, NY 10001</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0" title="Copy address">
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy address</span>
                        </Button>
                      </div>
                      
                      <Button className="mb-6 bg-pink-600 hover:bg-pink-700">
                        <Navigation className="mr-2 h-4 w-4" /> Get Directions
                      </Button>
                      
                      <h3 className="text-xl font-semibold mb-3">Transportation</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start">
                          <Car className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Parking</p>
                            <p className="text-gray-600">Street parking available. Parking garage located one block away.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 mr-2 mt-0.5">
                            <rect x="3" y="11" width="18" height="8" rx="2" />
                            <path d="M12 11V3" />
                            <path d="M7 3h10" />
                          </svg>
                          <div>
                            <p className="font-medium">Public Transit</p>
                            <p className="text-gray-600">Subway: Line A, B, C (2 blocks away)</p>
                            <p className="text-gray-600">Bus: Routes 15, 28 (1 block away)</p>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3">Neighborhood</h3>
                      <p className="text-gray-600 mb-6">
                        Located in the heart of the Fashion District, our salon is surrounded by boutique shops, cafes, and restaurants. The area is known for its vibrant atmosphere and is easily accessible from all parts of the city.
                      </p>
                    </div>
                    
                    <div className="md:w-1/2">
                      <h3 className="text-xl font-semibold mb-3">Hours of Operation</h3>
                      <div className="space-y-2 mb-6">
                        {businessHours.map((item, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="font-medium">{item.day}</span>
                            <span className="text-gray-600">{item.hours}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-pink-50 p-4 rounded-lg">
                        <h4 className="font-medium text-pink-800 mb-2">Holiday Hours</h4>
                        <p className="text-gray-700 text-sm">
                          We have special hours during holidays. Please check our website or call us for the most up-to-date information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Booking Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-20">
              <Card className="shadow-md border-pink-100">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle>Book Your Appointment</CardTitle>
                  <CardDescription className="text-white/90">Select date, time and services</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Date Picker */}
                    <div>
                      <Label className="text-base font-medium mb-2 block">Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Time Selector */}
                    <div>
                      <Label className="text-base font-medium mb-2 block">Select Time</Label>
                      <Select onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-60">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Selected Services */}
                    <div>
                      <Label className="text-base font-medium mb-2 block">Selected Services</Label>
                      {selectedServices.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                          <p className="text-gray-500">No services selected yet</p>
                          <p className="text-sm text-gray-400">Browse services and click "Book Now"</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedServices.map((service) => (
                            <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{service.duration}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">${service.price}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                  onClick={() => toggleServiceSelection(service)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Total Price */}
                    {selectedServices.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">Subtotal</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Tax</span>
                          <span>${(totalPrice * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center font-medium text-lg">
                          <span>Total</span>
                          <span>${(totalPrice * 1.08).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Book Button */}
                    <Button 
                      className="w-full bg-pink-600 hover:bg-pink-700 text-lg py-6" 
                      disabled={!date || !selectedTime || selectedServices.length === 0}
                    >
                      Book Appointment
                    </Button>
                    
                    {/* Cancellation Policy */}
                    <div className="text-sm text-gray-500">
                      <p className="font-medium mb-1">Cancellation Policy:</p>
                      <p>Free cancellation up to 24 hours before your appointment. Late cancellations may incur a 50% fee.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

