"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSalon } from "@/lib/api/salon"

interface Service {
  id: number
  name: string
  duration: string
  price: string
  description: string
}

interface Category {
  id: number
  name: string
  services: Service[]
}

interface EditingService extends Service {
  categoryId: number
}

// Type guard to check if data matches our Category interface
const isCategory = (item: any): item is Category => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    Array.isArray(item.services) &&
    item.services.every((service: any) =>
      typeof service === 'object' &&
      service !== null &&
      typeof service.id === 'number' &&
      typeof service.name === 'string' &&
      typeof service.duration === 'string' &&
      typeof service.price === 'string' &&
      typeof service.description === 'string'
    )
  )
}

// Transform legacy data structure to match Category type
const transformToCategory = (item: any, index: number): Category => {
  if (isCategory(item)) {
    return item
  }

  // Transform from the old format if needed
  if (item.categoryName && Array.isArray(item.subServices)) {
    return {
      id: index + 1,
      name: item.categoryName,
      services: item.subServices.map((service: any, serviceIndex: number) => ({
        id: (index + 1) * 100 + serviceIndex + 1,
        name: service.title || '',
        duration: `${service.duration || 0} min`,
        price: `$${service.price || 0}`,
        description: service.description || ''
      }))
    }
  }

  // Return a default category if data doesn't match any known format
  return {
    id: index + 1,
    name: 'Untitled Category',
    services: []
  }
}

// Sample services data with categories
const initialCategories: Category[] = [
  {
    id: 1,
    name: "Manicure",
    services: [
      {
        id: 101,
        name: "Basic Manicure",
        duration: "30 min",
        price: "$25",
        description: "A classic manicure including nail shaping, cuticle care, and polish application.",
      },
      {
        id: 102,
        name: "Gel Manicure",
        duration: "45 min",
        price: "$35",
        description: "Long-lasting gel polish that dries instantly and stays chip-free for up to two weeks.",
      },
      {
        id: 103,
        name: "Spa Manicure",
        duration: "60 min",
        price: "$45",
        description: "Luxurious treatment including exfoliation, massage, mask, and premium polish.",
      },
    ],
  },
  {
    id: 2,
    name: "Pedicure",
    services: [
      {
        id: 201,
        name: "Basic Pedicure",
        duration: "45 min",
        price: "$35",
        description: "Foot soak, nail trimming, cuticle care, and polish application.",
      },
      {
        id: 202,
        name: "Gel Pedicure",
        duration: "60 min",
        price: "$50",
        description: "Long-lasting gel polish pedicure with extended foot massage.",
      },
      {
        id: 203,
        name: "Spa Pedicure",
        duration: "75 min",
        price: "$65",
        description: "Premium pedicure with callus removal, exfoliation, mask, and extended massage.",
      },
    ],
  },
  {
    id: 3,
    name: "Eyebrows",
    services: [
      {
        id: 301,
        name: "Eyebrow Waxing",
        duration: "15 min",
        price: "$15",
        description: "Precise eyebrow shaping using warm wax for clean, defined brows.",
      },
      {
        id: 302,
        name: "Eyebrow Threading",
        duration: "20 min",
        price: "$18",
        description: "Traditional threading technique for precise hair removal and shaping.",
      },
      {
        id: 303,
        name: "Eyebrow Tinting",
        duration: "30 min",
        price: "$25",
        description: "Semi-permanent color applied to eyebrows for fuller, more defined appearance.",
      },
    ],
  },
  {
    id: 4,
    name: "Eyelashes",
    services: [
      {
        id: 401,
        name: "Classic Lash Extensions",
        duration: "90 min",
        price: "$120",
        description: "Individual lash extensions applied to each natural lash for a natural, enhanced look.",
      },
      {
        id: 402,
        name: "Volume Lash Extensions",
        duration: "120 min",
        price: "$150",
        description: "Multiple lightweight extensions applied to each natural lash for a fuller, dramatic effect.",
      },
      {
        id: 403,
        name: "Lash Lift",
        duration: "45 min",
        price: "$65",
        description: "Semi-permanent treatment that curls your natural lashes for an open-eye effect.",
      },
    ],
  },
]

export function ServicesCard() {
  const { salonData, updateSalonField } = useSalon()
  const [categories, setCategories] = useState<Category[]>(() => {
    if (salonData?.services) {
      // Transform the data to ensure it matches our Category type
      return Array.isArray(salonData.services)
        ? salonData.services.map(transformToCategory)
        : initialCategories
    }
    return initialCategories
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<EditingService | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  if (!salonData) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (JSON.stringify(salonData.services) !== JSON.stringify(categories)) {
        await updateSalonField('services', categories)
        toast.success("Services saved", {
          description: "Your salon services have been updated successfully."
        })
      }
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error("Failed to save", {
        description: "There was an error saving your services. Please try again."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (categoryId: number, service: Service) => {
    setEditingService({ ...service, categoryId })
    setSelectedCategory(categoryId.toString())
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingService(null)
    setSelectedCategory("")
    setIsDialogOpen(true)
  }

  const handleDelete = (categoryId: number, serviceId: number) => {
    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            services: category.services.filter((service) => service.id !== serviceId),
          }
        }
        return category
      }),
    )
    setIsDirty(true)
    toast("Service deleted", {
      description: "The service has been removed from your list.",
    })
  }

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const categoryId = Number.parseInt(formData.get("category") as string)
    const serviceData: Service = {
      id: editingService?.id || Date.now(),
      name: formData.get("name") as string,
      duration: formData.get("duration") as string,
      price: formData.get("price") as string,
      description: formData.get("description") as string,
    }

    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          if (editingService && editingService.categoryId === categoryId) {
            // Edit existing service in same category
            return {
              ...category,
              services: category.services.map((service) => (service.id === editingService.id ? serviceData : service)),
            }
          } else {
            // Add new service or move service to different category
            return {
              ...category,
              services: [...category.services, serviceData],
            }
          }
        } else if (editingService && editingService.categoryId === category.id) {
          // Remove service from old category if it was moved
          return {
            ...category,
            services: category.services.filter((service) => service.id !== editingService.id),
          }
        }
        return category
      }),
    )

    setIsDialogOpen(false)
    setIsDirty(true)

    toast(editingService ? "Service updated" : "Service added", {
      description: editingService
        ? "The service has been updated successfully."
        : "The new service has been added successfully.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Services Management</CardTitle>
            <CardDescription>Manage the services your salon offers</CardDescription>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id.toString()}>
              <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                <span className="font-semibold">{category.name}</span>
                <span className="text-sm text-muted-foreground ml-2">({category.services.length} services)</span>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Service Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{service.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{service.duration}</TableCell>
                        <TableCell>{service.price}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category.id, service)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id, service.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingService(null)
                      setSelectedCategory(category.id.toString())
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add to {category.name}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update the details of this service." : "Add a new service to your salon offerings."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveService}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={selectedCategory} required onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input id="name" name="name" defaultValue={editingService?.name || ""} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      defaultValue={editingService?.duration || ""}
                      required
                      placeholder="e.g. 60 min"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      defaultValue={editingService?.price || ""}
                      required
                      placeholder="e.g. $75"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={editingService?.description || ""}
                    placeholder="Describe this service..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">{editingService ? "Update Service" : "Add Service"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

