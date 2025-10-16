"use client"

import { useState, useEffect } from "react"
import { router } from '@inertiajs/react'

interface Gym {
  id: number
  name: string
  location: string
  gym_type: string
  equipment_type: string
  price: string
  description: string
  main_image: string | null
  facilities: string
  is_active: boolean
  opening_hours: string
  latitude: number
  longitude: number
  category?: string // Add this if you have a category field
}

// Updated gym categories to match your actual gym_type values
const gymCategories = [
  {
    id: 'strength',
    name: 'Strength Training',
    icon: '💪',
    description: 'Powerlifting, bodybuilding, and strength-focused equipment',
    gymTypes: ['Powerlifting', 'Bodybuilding', 'Strength Training', 'Strength'], // Added 'Strength'
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'cardio',
    name: 'Cardio Centers',
    icon: '🏃',
    description: 'Treadmills, ellipticals, and cardio machines',
    gymTypes: ['Commercial', 'Cardio Focus', 'Cardio Machines'], // Added 'Cardio Machines'
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'yoga',
    name: 'Yoga & Pilates',
    icon: '🧘',
    description: 'Mind-body connection and flexibility training',
    gymTypes: ['Yoga Studio', 'Boutique', 'Yoga'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'crossfit',
    name: 'CrossFit Boxes',
    icon: '⚡',
    description: 'High-intensity functional training',
    gymTypes: ['CrossFit', 'Functional Training'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'premium',
    name: 'Premium Clubs',
    icon: '👑',
    description: 'Luxury facilities with premium amenities',
    gymTypes: ['Commercial', 'Boutique', 'Premium'],
    color: 'from-yellow-500 to-amber-500'
  },
  {
    id: '24_7',
    name: '24/7 Access',
    icon: '🕒',
    description: 'Work out anytime that fits your schedule',
    gymTypes: ['24/7 Access', '24/7 Gym'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'women_only',
    name: 'Women Only',
    icon: '👩',
    description: 'Safe and comfortable environment for women',
    gymTypes: ['Women Only'],
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'functional',
    name: 'Functional Training',
    icon: '🏋️',
    description: 'Real-life movement patterns and exercises',
    gymTypes: ['Functional Training', 'CrossFit'],
    color: 'from-teal-500 to-cyan-500'
  }
]

interface GymCategoryProps {
  gyms: Gym[]
  onCategorySelect?: (categoryGyms: Gym[], categoryName: string) => void
}

const GymCategory = ({ gyms, onCategorySelect }: GymCategoryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryGyms, setCategoryGyms] = useState<Gym[]>([])

  // Get gyms by category - UPDATED to check both gym_type and category fields
  const getGymsByCategory = (categoryId: string) => {
    const category = gymCategories.find(cat => cat.id === categoryId)
    if (!category) return []

    return gyms.filter(gym => {
      // Check if gym_type matches any of the category types
      const gymTypeMatch = category.gymTypes.some(type =>
        gym.gym_type.toLowerCase().includes(type.toLowerCase())
      )

      // Also check the category field if it exists
      const categoryFieldMatch = gym.category &&
        category.gymTypes.some(type =>
          gym.category?.toLowerCase().includes(type.toLowerCase())
        )

      return gymTypeMatch || categoryFieldMatch
    })
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const category = gymCategories.find(cat => cat.id === categoryId)
    if (!category) return

    const filteredGyms = getGymsByCategory(categoryId)
    setSelectedCategory(categoryId)
    setCategoryGyms(filteredGyms)

    // Call parent callback if provided
    if (onCategorySelect) {
      onCategorySelect(filteredGyms, category.name)
    }
  }

  // Reset category filter
  const handleResetCategory = () => {
    setSelectedCategory(null)
    setCategoryGyms([])
    if (onCategorySelect) {
      onCategorySelect([], '')
    }
  }

  // Format price for display - UPDATED to match GymSearch
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price)
    if (isNaN(priceNum)) return price
    return `$${price}` // Changed to $ to match GymSearch
  }

  const handleGymClick = (gymId: number) => {
    router.visit(`/gyms/${gymId}`)
  }

  // Get current status for opening hours - ADDED to match GymSearch
  const getCurrentStatus = (openingHours: string): boolean => {
    try {
      let hours;
      try {
        hours = JSON.parse(openingHours)
      } catch {
        hours = JSON.parse(JSON.parse(openingHours))
      }

      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
      const currentTime = now.getHours() * 100 + now.getMinutes()

      if (hours[currentDay]) {
        const daySchedule = hours[currentDay]
        if (daySchedule.open) {
          const [openHours, openMinutes] = daySchedule.from.split(':').map(Number)
          const [closeHours, closeMinutes] = daySchedule.to.split(':').map(Number)

          const openTime = openHours * 100 + openMinutes
          const closeTime = closeHours * 100 + closeMinutes

          return currentTime >= openTime && currentTime <= closeTime
        }
      }
      return false
    } catch (error) {
      return false
    }
  }

  return (
    <section className="py-16 bg-background"> {/* Changed to bg-background to match GymSearch */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Browse Gyms by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect workout environment for your fitness goals
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {gymCategories.map((category) => {
            const gymCount = getGymsByCategory(category.id).length
            return (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`relative rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 hover:scale-105 group overflow-hidden ${
                  selectedCategory === category.id
                    ? 'border-primary bg-primary/10 shadow-lg' // Updated to use primary colors
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md' // Updated to match GymSearch
                }`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 group-hover:text-foreground">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-semibold text-sm bg-primary/10 px-2 py-1 rounded-full">
                      {gymCount} {gymCount === 1 ? 'gym' : 'gyms'}
                    </span>
                    {selectedCategory === category.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResetCategory()
                        }}
                        className="text-destructive text-sm font-semibold hover:text-destructive/80 bg-destructive/10 px-2 py-1 rounded-full"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Category Gyms */}
        {selectedCategory && categoryGyms.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {gymCategories.find(c => c.id === selectedCategory)?.name} Gyms
                </h3>
                <p className="text-muted-foreground mt-2">
                  Showing {categoryGyms.length} gyms in this category
                </p>
              </div>
              <button
                onClick={handleResetCategory}
                className="text-muted-foreground hover:text-foreground font-semibold"
              >
                View All Categories
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryGyms.map((gym) => {
                const isOpen = getCurrentStatus(gym.opening_hours)

                return (
                  <div
                    key={gym.id}
                    onClick={() => handleGymClick(gym.id)}
                    className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        // src={gym.main_image ? `/storage/${gym.main_image}` : "/placeholder.svg"}
                        // Replace all image src attributes with:
src={gym.main_image ? `/storage/${gym.main_image}` : "/placeholder.svg"}
                        alt={gym.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-foreground">
                        {formatPrice(gym.price)}
                      </div>
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                          isOpen ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                        }`}
                      >
                        <span className="text-xs">{isOpen ? "Open Now" : "Closed"}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {gym.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>🏋️ {gym.gym_type}</span>
                        <span>•</span>
                        <span>{gym.equipment_type}</span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                        <span>📍 {gym.location}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{gym.description}</p>

                      {/* Facilities */}
                      {gym.facilities && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {gym.facilities.split(',').slice(0, 3).map((facility, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                              {facility.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
<button
  onClick={() => router.visit(`/gyms/${gym.id}`)}
  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium transition-colors"
>
  View Details
</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No Gyms in Selected Category */}
        {selectedCategory && categoryGyms.length === 0 && (
          <div className="text-center py-12 bg-muted rounded-xl">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No gyms found in this category</h3>
            <p className="text-muted-foreground mb-4">We're working on adding more {gymCategories.find(c => c.id === selectedCategory)?.name?.toLowerCase()} gyms</p>
            <button
              onClick={handleResetCategory}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Categories
            </button>
          </div>
        )}

        {/* No Category Selected - Show Stats */}
        {!selectedCategory && (
         <div className="text-center bg-background rounded-2xl p-8 border border-border">
  <h3 className="text-2xl font-bold text-foreground mb-4">Find Your Perfect Fit</h3>
  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
    With {gyms.length} gyms across {gymCategories.length} categories, you're sure to find the perfect workout space that matches your fitness goals and preferences.
  </p>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="text-2xl font-bold text-primary">{gyms.length}</div>
      <div className="text-sm text-muted-foreground">Total Gyms</div>
    </div>
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="text-2xl font-bold text-primary">{gymCategories.length}</div>
      <div className="text-sm text-muted-foreground">Categories</div>
    </div>
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="text-2xl font-bold text-primary">
        {Math.max(...gymCategories.map(cat => getGymsByCategory(cat.id).length))}
      </div>
      <div className="text-sm text-muted-foreground">Most Popular</div>
    </div>
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="text-2xl font-bold text-primary">24/7</div>
      <div className="text-sm text-muted-foreground">Available</div>
    </div>
  </div>
</div>
        )}
      </div>
    </section>
  )
}

export default GymCategory
