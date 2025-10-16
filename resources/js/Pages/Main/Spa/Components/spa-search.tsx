"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Heart, DollarSign, Clock } from "lucide-react"
import { router, usePage } from '@inertiajs/react'

// Filter options for spa
const treatmentTypes = [
  "All Treatments",
  "Massage Therapy",
  "Facial Treatments",
  "Body Treatments",
  "Aromatherapy",
  "Hydrotherapy",
  "Meditation",
  "Yoga",
  "Detox Programs",
  "Couples Treatments"
]

const ambianceTypes = [
  "All Ambiances",
  "Zen & Serene",
  "Luxury & Premium",
  "Traditional",
  "Modern & Chic",
  "Nature-Inspired",
  "Minimalist",
  "Romantic"
]

const priceRanges = ["All Prices", "50", "100", "150", "200", "250", "300", "350", "400", "450", "500+"]

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

const SpaSearch = () => {
  const { props } = usePage()
  const spasFromServer = (props.spas as Spa[]) || []

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTreatment, setSelectedTreatment] = useState("All Treatments")
  const [selectedPrice, setSelectedPrice] = useState("All Prices")
  const [selectedAmbiance, setSelectedAmbiance] = useState("All Ambiances")
  const [filteredSpas, setFilteredSpas] = useState<Spa[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allSpas, setAllSpas] = useState<Spa[]>([])

  // Use spas from server-side props instead of API call
  useEffect(() => {
    console.log('🧖 Spas from server:', spasFromServer)

    if (spasFromServer.length > 0) {
      // Transform the data to match expected format
      const transformedSpas = spasFromServer.map((spa: Spa) => ({
        ...spa,
        // Keep the original price value
        price: spa.price,
        // Ensure facilities is properly formatted
        facilities: Array.isArray(spa.facilities) ? spa.facilities :
                   typeof spa.facilities === 'string' ? [spa.facilities] : []
      }))

      setAllSpas(transformedSpas)
      setFilteredSpas(transformedSpas)
      console.log('✅ Transformed spas:', transformedSpas)
    } else {
      console.log('❌ No spas received from server')
      setError('No spas available. Please check back later.')
    }
  }, [spasFromServer])

  // Format price for display
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price)
    if (isNaN(priceNum)) return price
    return `$${price}`
  }

  // Client-side filtering
  useEffect(() => {
    if (!allSpas.length) return

    console.log('🔍 Applying spa filters...', {
      searchTerm,
      selectedTreatment,
      selectedPrice,
      selectedAmbiance,
      totalSpas: allSpas.length
    })

    let filtered = [...allSpas]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(spa =>
        spa.name.toLowerCase().includes(term) ||
        spa.location.toLowerCase().includes(term) ||
        spa.treatment_type.toLowerCase().includes(term) ||
        spa.ambiance_type.toLowerCase().includes(term) ||
        spa.facilities.some(facility => facility.toLowerCase().includes(term)) ||
        spa.price.toLowerCase().includes(term)
      )
    }

    if (selectedTreatment !== 'All Treatments') {
      filtered = filtered.filter(spa =>
        spa.treatment_type.toLowerCase().includes(selectedTreatment.toLowerCase())
      )
    }

    if (selectedPrice !== 'All Prices') {
      if (selectedPrice === '500+') {
        // Filter for prices 500 and above
        filtered = filtered.filter(spa => {
          const priceNum = parseInt(spa.price)
          return !isNaN(priceNum) && priceNum >= 500
        })
      } else {
        // Filter for exact price match
        filtered = filtered.filter(spa => spa.price === selectedPrice)
      }
    }

    if (selectedAmbiance !== 'All Ambiances') {
      filtered = filtered.filter(spa =>
        spa.ambiance_type.toLowerCase().includes(selectedAmbiance.toLowerCase())
      )
    }

    console.log('📈 Spa filtering complete:', {
      before: allSpas.length,
      after: filtered.length
    })

    setFilteredSpas(filtered)
  }, [searchTerm, selectedTreatment, selectedPrice, selectedAmbiance, allSpas])

  const handleSpaClick = (spaId: number) => {
    console.log('🎯 Navigating to spa:', spaId)
    router.visit(`/spa/${spaId}`)
  }

  const getCurrentStatus = (openingHours: any): boolean => {
    try {
      console.log('🕒 Checking spa opening hours:', openingHours)

      // Handle different formats of opening hours
      let hours = openingHours;

      // If it's a string, try to parse it
      if (typeof openingHours === 'string') {
        try {
          hours = JSON.parse(openingHours)
        } catch {
          // If first parse fails, try parsing again (in case it's double-encoded)
          hours = JSON.parse(JSON.parse(openingHours))
        }
      }

      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
      const currentTime = now.getHours() * 100 + now.getMinutes()

      console.log('📅 Current day:', currentDay, 'Time:', currentTime)
      console.log('🏢 Spa hours for today:', hours[currentDay])

      if (hours && hours[currentDay]) {
        const daySchedule = hours[currentDay]

        // Handle format: {"Monday":{"open":true,"from":"06:00","to":"22:00"}}
        if (daySchedule.open) {
          const [openHours, openMinutes] = daySchedule.from.split(':').map(Number)
          const [closeHours, closeMinutes] = daySchedule.to.split(':').map(Number)

          const openTime = openHours * 100 + openMinutes
          const closeTime = closeHours * 100 + closeMinutes

          const isOpen = currentTime >= openTime && currentTime <= closeTime
          console.log('🚪 Spa status:', isOpen ? 'OPEN' : 'CLOSED')
          return isOpen
        }
      }

      console.log('🚪 Spa status: CLOSED (no schedule found)')
      return false
    } catch (error) {
      console.error('❌ Error parsing spa opening hours:', error)
      return false
    }
  }

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-foreground">Find Your Perfect Spa</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search by location, treatment type, ambiance, or browse our curated wellness collection
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
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Treatment Type Filter */}
            <div className="relative">
              <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedTreatment}
                onChange={(e) => setSelectedTreatment(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-600 appearance-none cursor-pointer"
              >
                {treatmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
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
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-600 appearance-none cursor-pointer"
              >
                {priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price === "All Prices" ? price : `$${price}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Ambiance Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedAmbiance}
                onChange={(e) => setSelectedAmbiance(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-600 appearance-none cursor-pointer"
              >
                {ambianceTypes.map((ambiance) => (
                  <option key={ambiance} value={ambiance}>
                    {ambiance}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-foreground">{filteredSpas.length}</span> spas
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && filteredSpas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpas.map((spa) => {
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
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {formatPrice(spa.price)}
                    </div>
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                        isOpen ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                      }`}
                    >
                      <Clock size={14} className="inline mr-1" />
                      {isOpen ? "Open Now" : "Closed"}
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
                      <Heart size={16} />
                      <span>{spa.treatment_type}</span>
                      <span>•</span>
                      <span>{spa.ambiance_type}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{spa.location}</span>
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
        )}

        {/* No Results */}
        {!loading && filteredSpas.length === 0 && allSpas.length > 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧖</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No spas found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        )}

        {/* No Spas Available */}
        {!loading && allSpas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💆</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No spas available</h3>
            <p className="text-muted-foreground">Check back later for new spa listings</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default SpaSearch
