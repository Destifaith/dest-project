"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, ChefHat, DollarSign, Star, Clock } from "lucide-react"
import { router } from '@inertiajs/react'

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
]

const priceRanges = ["All Prices", "$", "$$", "$$$", "$$$$"]

const eateryTypes = ["All Types", "Restaurant", "Cafe", "Bar", "Food Truck", "Fine Dining", "Casual Dining"]

interface Eatery {
  id: number
  name: string
  cuisine_type: string
  location: string
  price_range: string
  eatery_type: string
  description: string
  main_image: string | null
  features: string[]
  status: 'open' | 'closed'
  rating: number
  is_open: boolean
  current_status: string
  today_hours: string
}

const EaterySearch = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("All Cuisines")
  const [selectedPrice, setSelectedPrice] = useState("All Prices")
  const [selectedType, setSelectedType] = useState("All Types")
  const [filteredEateries, setFilteredEateries] = useState<Eatery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchEateries = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (searchTerm) params.append('search', searchTerm)
      if (selectedCuisine !== 'All Cuisines') params.append('cuisine_type', selectedCuisine)
      if (selectedPrice !== 'All Prices') params.append('price_range', selectedPrice)
      if (selectedType !== 'All Types') params.append('eatery_type', selectedType)

      const response = await fetch(`/api/eateries/search?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch eateries')
      }

      const data = await response.json()
      setFilteredEateries(data)
    } catch (err) {
      setError('Failed to load eateries. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search on filter change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEateries()
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCuisine, selectedPrice, selectedType])

  const handleEateryClick = (eateryId: number) => {
    router.visit(`/eatery-detailed?id=${eateryId}`)
  }

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Find Your Perfect Dining Experience</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search by cuisine, location, price range, or browse our curated collection
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-12 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Cuisine Filter */}
            <div className="relative">
              <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
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
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {eateryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Searching eateries...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-foreground">{filteredEateries.length}</span> eateries
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEateries.map((eatery) => (
              <div
                key={eatery.id}
                onClick={() => handleEateryClick(eatery.id)}
                className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={eatery.main_image || "/placeholder.svg"}
                    alt={eatery.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {eatery.price_range}
                  </div>
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                      eatery.is_open ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                    }`}
                  >
                    <Clock size={14} className="inline mr-1" />
                    {eatery.is_open ? "Open Now" : "Closed"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {eatery.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star size={16} className="fill-primary text-primary" />
                      <span>{eatery.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <ChefHat size={16} />
                    <span>{eatery.cuisine_type}</span>
                    <span>•</span>
                    <span>{eatery.eatery_type}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{eatery.location}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{eatery.description}</p>

                  {/* Features */}
                  {eatery.features && eatery.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {eatery.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredEateries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No eateries found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default EaterySearch
