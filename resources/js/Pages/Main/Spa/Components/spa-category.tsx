"use client"

import { useState, useEffect } from "react"
import { router } from '@inertiajs/react'

interface Spa {
  id: number
  name: string
  location: string
  treatment_type: string
  ambiance_type: string
  price: string
  description: string
  main_image: string | null
  facilities: string[]
  status: string
  opening_hours: any
  latitude: number
  longitude: number
}

// Spa categories based on treatment types and ambiance
const spaCategories = [
  {
    id: 'massage',
    name: 'Massage Therapy',
    icon: '💆',
    description: 'Relaxing and therapeutic massage treatments',
    treatmentTypes: ['Massage Therapy', 'Swedish Massage', 'Deep Tissue', 'Thai Massage', 'Sports Massage'],
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'facial',
    name: 'Facial Treatments',
    icon: '✨',
    description: 'Skin rejuvenation and beauty treatments',
    treatmentTypes: ['Facial Treatments', 'Anti-Aging', 'Acne Treatment', 'Hydrating Facial', 'Brightening Facial'],
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'body',
    name: 'Body Treatments',
    icon: '🛁',
    description: 'Full body wellness and detoxification',
    treatmentTypes: ['Body Treatments', 'Body Wrap', 'Scrubs', 'Detox Programs', 'Hydrotherapy'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'aromatherapy',
    name: 'Aromatherapy',
    icon: '🌿',
    description: 'Healing through essential oils and scents',
    treatmentTypes: ['Aromatherapy', 'Essential Oils', 'Scent Therapy'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'wellness',
    name: 'Wellness Programs',
    icon: '🧘',
    description: 'Holistic health and wellness journeys',
    treatmentTypes: ['Wellness Programs', 'Detox Programs', 'Meditation', 'Yoga', 'Mindfulness'],
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'luxury',
    name: 'Luxury Spas',
    icon: '👑',
    description: 'Premium treatments in luxurious settings',
    treatmentTypes: ['Luxury Treatments', 'VIP Spa', 'Premium Spa'],
    ambianceTypes: ['Luxury & Premium', 'Modern & Chic'],
    color: 'from-yellow-500 to-amber-500'
  },
  {
    id: 'couples',
    name: 'Couples Retreat',
    icon: '💑',
    description: 'Romantic spa experiences for couples',
    treatmentTypes: ['Couples Treatments', 'Romantic Packages'],
    ambianceTypes: ['Romantic'],
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'traditional',
    name: 'Traditional Therapies',
    icon: '🎎',
    description: 'Ancient healing methods and techniques',
    treatmentTypes: ['Traditional', 'Ayurveda', 'Chinese Medicine', 'Thai Traditional'],
    ambianceTypes: ['Traditional'],
    color: 'from-brown-500 to-amber-500'
  }
]

interface SpaCategoryProps {
  spas: Spa[]
  onCategorySelect?: (categorySpas: Spa[], categoryName: string) => void
}

const SpaCategory = ({ spas, onCategorySelect }: SpaCategoryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categorySpas, setCategorySpas] = useState<Spa[]>([])

  // Get spas by category
  const getSpasByCategory = (categoryId: string) => {
    const category = spaCategories.find(cat => cat.id === categoryId)
    if (!category) return []

    return spas.filter(spa => {
      // Check if treatment_type matches any of the category types
      const treatmentMatch = category.treatmentTypes.some(type =>
        spa.treatment_type.toLowerCase().includes(type.toLowerCase())
      )

      // Also check ambiance_type if specified for the category
      const ambianceMatch = category.ambianceTypes ?
        category.ambianceTypes.some(type =>
          spa.ambiance_type.toLowerCase().includes(type.toLowerCase())
        ) : true

      return treatmentMatch && ambianceMatch
    })
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const category = spaCategories.find(cat => cat.id === categoryId)
    if (!category) return

    const filteredSpas = getSpasByCategory(categoryId)
    setSelectedCategory(categoryId)
    setCategorySpas(filteredSpas)

    // Call parent callback if provided
    if (onCategorySelect) {
      onCategorySelect(filteredSpas, category.name)
    }
  }

  // Reset category filter
  const handleResetCategory = () => {
    setSelectedCategory(null)
    setCategorySpas([])
    if (onCategorySelect) {
      onCategorySelect([], '')
    }
  }

  // Format price for display
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price)
    if (isNaN(priceNum)) return price
    return `$${price}`
  }

  const handleSpaClick = (spaId: number) => {
    router.visit(`/spa/${spaId}`)
  }

  // Get current status for opening hours
  const getCurrentStatus = (openingHours: any): boolean => {
    try {
      let hours = openingHours;

      // If it's a string, try to parse it
      if (typeof openingHours === 'string') {
        try {
          hours = JSON.parse(openingHours)
        } catch {
          hours = JSON.parse(JSON.parse(openingHours))
        }
      }

      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
      const currentTime = now.getHours() * 100 + now.getMinutes()

      if (hours && hours[currentDay]) {
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
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-foreground">Browse Spas by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect wellness experience for your relaxation needs
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {spaCategories.map((category) => {
            const spaCount = getSpasByCategory(category.id).length
            return (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`relative rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 hover:scale-105 group overflow-hidden ${
                  selectedCategory === category.id
                    ? 'border-amber-600 bg-amber-50 shadow-lg'
                    : 'border-border bg-card hover:border-amber-400 hover:shadow-md'
                }`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-amber-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 group-hover:text-foreground">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700 font-semibold text-sm bg-amber-100 px-2 py-1 rounded-full">
                      {spaCount} {spaCount === 1 ? 'spa' : 'spas'}
                    </span>
                    {selectedCategory === category.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResetCategory()
                        }}
                        className="text-gray-600 text-sm font-semibold hover:text-gray-800 bg-gray-100 px-2 py-1 rounded-full"
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

        {/* Selected Category Spas */}
        {selectedCategory && categorySpas.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {spaCategories.find(c => c.id === selectedCategory)?.name} Spas
                </h3>
                <p className="text-muted-foreground mt-2">
                  Showing {categorySpas.length} spas in this category
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
              {categorySpas.map((spa) => {
                const isOpen = getCurrentStatus(spa.opening_hours)

                return (
                  <div
                    key={spa.id}
                    onClick={() => handleSpaClick(spa.id)}
                    className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={spa.main_image ? `/storage/${spa.main_image}` : "/placeholder.svg"}
                        alt={spa.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-foreground">
                        {formatPrice(spa.price)}
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
                        <h3 className="text-xl font-bold text-foreground group-hover:text-amber-700 transition-colors">
                          {spa.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>💆 {spa.treatment_type}</span>
                        <span>•</span>
                        <span>{spa.ambiance_type}</span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                        <span>📍 {spa.location}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{spa.description}</p>

                      {/* Facilities */}
                      {spa.facilities && spa.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {spa.facilities.slice(0, 3).map((facility, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                              {facility.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <button
                        onClick={() => router.visit(`/spa/${spa.id}`)}
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-lg font-medium transition-colors"
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

        {/* No Spas in Selected Category */}
        {selectedCategory && categorySpas.length === 0 && (
          <div className="text-center py-12 bg-muted rounded-xl">
            <div className="text-6xl mb-4">💆</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No spas found in this category</h3>
            <p className="text-muted-foreground mb-4">We're working on adding more {spaCategories.find(c => c.id === selectedCategory)?.name?.toLowerCase()} spas</p>
            <button
              onClick={handleResetCategory}
              className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition-colors"
            >
              Browse All Categories
            </button>
          </div>
        )}

        {/* No Category Selected - Show Stats */}
        {!selectedCategory && (
          <div className="text-center bg-background rounded-2xl p-8 border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">Find Your Perfect Wellness Retreat</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              With {spas.length} spas across {spaCategories.length} categories, you're sure to find the perfect wellness experience that matches your relaxation goals and preferences.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
                <div className="text-2xl font-bold text-amber-700">{spas.length}</div>
                <div className="text-sm text-muted-foreground">Total Spas</div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
                <div className="text-2xl font-bold text-amber-700">{spaCategories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
                <div className="text-2xl font-bold text-amber-700">
                  {Math.max(...spaCategories.map(cat => getSpasByCategory(cat.id).length))}
                </div>
                <div className="text-sm text-muted-foreground">Most Popular</div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
                <div className="text-2xl font-bold text-amber-700">Relaxing</div>
                <div className="text-sm text-muted-foreground">Experiences</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default SpaCategory
