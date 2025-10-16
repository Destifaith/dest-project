"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, ChefHat, DollarSign, Star, Clock, Utensils, Phone, Globe } from "lucide-react"
import { router } from '@inertiajs/react'

// Updated to match restaurant-specific data
const cuisineTypes = [
  "All Cuisines",
  "Italian",
  "Japanese",
  "Mexican",
  "Chinese",
  "French",
  "Indian",
  "Thai",
  "Mediterranean",
  "American",
  "African",
  "Caribbean",
  "Spanish",
  "Greek",
  "Korean",
  "Vietnamese",
]

const priceRanges = ["All Prices", "$", "$$", "$$$", "$$$$"]

const featuresList = [
  "All Features",
  "Outdoor Seating",
  "Live Music",
  "Wine Bar",
  "Vegetarian Friendly",
  "Vegan Options",
  "Gluten-Free Options",
  "Family Friendly",
  "Romantic",
  "Business Meetings",
  "Wheelchair Accessible",
  "Parking Available",
  "Reservations",
  "Delivery",
  "Takeout",
  "Catering"
]

interface Restaurant {
  id: number
  name: string
  location: string
  description: string
  cuisine_type: string
  latitude: string
  longitude: string
  opening_hours: Record<string, any>
  special_closure_days?: string
  contact_phone: string
  contact_email?: string
  website?: string
  capacity?: number
  features: string[]
  reservation_policy?: string
  has_daily_menu: boolean
  daily_menu_email?: string
  main_image: string | null
  gallery_images: string[] | null
  menu_pdf: string | null
  owner_full_name?: string
  owner_bio?: string
  owner_experience_years?: number
  owner_specialties?: string
  owner_education?: string
  owner_image?: string | null
  is_active: boolean
  awards: Award[]
  created_at: string
  updated_at: string
}

interface Award {
  id: number
  title: string
  description?: string
  year: string
  image?: string
  restaurant_id: number
  created_at: string
  updated_at: string
}

const RestaurantsSearch = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("All Cuisines")
  const [selectedPrice, setSelectedPrice] = useState("All Prices")
  const [selectedFeature, setSelectedFeature] = useState("All Features")
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRestaurants = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (searchTerm) params.append('search', searchTerm)
      if (selectedCuisine !== 'All Cuisines') params.append('cuisine_type', selectedCuisine)
      if (selectedPrice !== 'All Prices') params.append('price_range', selectedPrice)
      if (selectedFeature !== 'All Features') params.append('feature', selectedFeature)

      // Using the restaurants API endpoint - only active restaurants
      const response = await fetch(`/restaurants/all?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants')
      }

      const data = await response.json()
      // Filter only active restaurants on frontend as additional safety
      const activeRestaurants = data.filter((restaurant: Restaurant) => restaurant.is_active)
      setFilteredRestaurants(activeRestaurants)
    } catch (err) {
      setError('Failed to load restaurants. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search on filter change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRestaurants()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCuisine, selectedPrice, selectedFeature])

  const handleRestaurantClick = (restaurantId: number) => {
    router.visit(`/restaurants/${restaurantId}`)
  }

  // Helper function to determine if restaurant is open
  const getCurrentStatus = (openingHours: Record<string, any>): { isOpen: boolean; statusText: string } => {
    if (!openingHours || typeof openingHours !== 'object') {
      return { isOpen: false, statusText: "Hours not available" }
    }

    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[now.getDay()]
    const currentTime = now.getHours() * 100 + now.getMinutes()

    const todayHours = openingHours[today]

    if (!todayHours || todayHours.closed || !todayHours.open || !todayHours.close) {
      return { isOpen: false, statusText: "Closed today" }
    }

    const openTime = parseInt(todayHours.open.replace(':', ''))
    const closeTime = parseInt(todayHours.close.replace(':', ''))

    const isOpen = currentTime >= openTime && currentTime <= closeTime

    return {
      isOpen,
      statusText: isOpen ? `Open until ${todayHours.close}` : `Opens at ${todayHours.open}`
    }
  }

  // Helper to display features
  const displayFeatures = (features: string[]) => {
    return features.slice(0, 3)
  }

  // Estimate price range based on features and cuisine
  const getPriceRange = (restaurant: Restaurant): string => {
    // Simple estimation based on cuisine type and features
    const premiumCuisines = ['French', 'Japanese', 'Italian']
    const hasPremiumFeatures = restaurant.features?.some(feature =>
      ['Fine Dining', 'Wine Bar', 'Business Meetings'].includes(feature)
    )

    if (premiumCuisines.includes(restaurant.cuisine_type) || hasPremiumFeatures) {
      return "$$$"
    }

    if (restaurant.cuisine_type === 'Fast Food' || restaurant.features?.includes('Food Truck')) {
      return "$"
    }

    return "$$" // Default to medium price
  }

  // Get first award title for display
  const getAwardTitle = (awards: Award[]): string | null => {
    if (!awards || awards.length === 0) return null
    return awards[0].title
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Discover Exceptional Dining
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect restaurant with our curated collection of culinary experiences
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search restaurants or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Cuisine Filter */}
            <div className="relative">
              <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
              >
                {cuisineTypes.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
              >
                {priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price}
                  </option>
                ))}
              </select>
            </div>

            {/* Features Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
              >
                {featuresList.map((feature) => (
                  <option key={feature} value={feature}>
                    {feature}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Discovering amazing restaurants...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg">
            <p>{error}</p>
            <button
              onClick={searchRestaurants}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredRestaurants.length}</span> restaurants
            </p>
            <div className="text-sm text-gray-500">
              Showing active restaurants only
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => {
              const { isOpen, statusText } = getCurrentStatus(restaurant.opening_hours)
              const firstAward = getAwardTitle(restaurant.awards)

              return (
                <div
                  key={restaurant.id}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group cursor-pointer h-full flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.main_image ? `/storage/${restaurant.main_image}` : "/placeholder-restaurant.jpg"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getPriceRange(restaurant)}
                    </div>
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                        isOpen ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                      }`}
                    >
                      <Clock size={14} className="inline mr-1" />
                      {isOpen ? "Open Now" : "Closed"}
                    </div>

                    {/* Awards Badge */}
                    {firstAward && (
                      <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                        🏆 {firstAward}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {restaurant.name}
                      </h3>
                      {restaurant.awards && restaurant.awards.length > 0 && (
                        <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                          <Star size={16} className="fill-yellow-400" />
                          <span>{restaurant.awards.length}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <ChefHat size={16} />
                      <span className="font-medium">{restaurant.cuisine_type}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{restaurant.location}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {restaurant.description}
                    </p>

                    {/* Features */}
                    {restaurant.features && restaurant.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {displayFeatures(restaurant.features).map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                          >
                            {feature}
                          </span>
                        ))}
                        {restaurant.features.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md">
                            +{restaurant.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {restaurant.contact_phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{restaurant.contact_phone}</span>
                        </div>
                      )}
                      {restaurant.website && (
                        <div className="flex items-center gap-1">
                          <Globe size={14} />
                          <span>Website</span>
                        </div>
                      )}
                    </div>

                    {/* Status and CTA */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {statusText}
                      </div>
                      <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors transform group-hover:scale-105">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">No restaurants found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all restaurants</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCuisine("All Cuisines")
                setSelectedPrice("All Prices")
                setSelectedFeature("All Features")
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default RestaurantsSearch
