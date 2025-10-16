"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Dumbbell, DollarSign, Star, Clock } from "lucide-react"
import { router, usePage } from '@inertiajs/react'

const gymTypes = [
  "All Types",
  "Commercial",
  "Boutique",
  "CrossFit",
  "Powerlifting",
  "Bodybuilding",
  "Women Only",
  "24/7 Access",
  "Yoga Studio",
  "24/7 Gym"
]

// Update price ranges to use actual values instead of symbols
const priceRanges = ["All Prices", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100+"]

const equipmentTypes = [
  "All Equipment",
  "Cardio Machines",
  "Cardio Focus",
  "Strength Training",
  "Free Weights",
  "Machines Only",
  "Functional Training",
  "Olympic Lifting"
]

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
}

const GymSearch = () => {
  const { props } = usePage()
  const gymsFromServer = (props.gyms as Gym[]) || []

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGymType, setSelectedGymType] = useState("All Types")
  const [selectedPrice, setSelectedPrice] = useState("All Prices")
  const [selectedEquipment, setSelectedEquipment] = useState("All Equipment")
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allGyms, setAllGyms] = useState<Gym[]>([])

  // Use gyms from server-side props instead of API call
  useEffect(() => {
    console.log('🏋️ Gyms from server:', gymsFromServer)

    if (gymsFromServer.length > 0) {
      // Transform the data to match expected format - KEEP ORIGINAL PRICE
      const transformedGyms = gymsFromServer.map((gym: Gym) => ({
        ...gym,
        // Keep the original price value, don't convert to symbols
        price: gym.price,
        // Parse facilities if it's a JSON string
        facilities: parseFacilities(gym.facilities)
      }))

      setAllGyms(transformedGyms)
      setFilteredGyms(transformedGyms)
      console.log('✅ Transformed gyms:', transformedGyms)
    } else {
      console.log('❌ No gyms received from server')
      setError('No gyms available. Please check back later.')
    }
  }, [gymsFromServer])

  // Helper function to parse facilities
  const parseFacilities = (facilities: string): string => {
    try {
      // If it's a JSON string, parse it
      if (facilities.startsWith('"') || facilities.startsWith('[')) {
        const parsed = JSON.parse(facilities)
        if (Array.isArray(parsed)) {
          return parsed.join(', ')
        }
        return String(parsed)
      }
      return facilities
    } catch {
      return facilities
    }
  }

  // Format price for display (add currency symbol)
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price)
    if (isNaN(priceNum)) return price
    return `$${price}` // Ghanaian Cedi symbol + price
  }

  // Client-side filtering
  useEffect(() => {
    if (!allGyms.length) return

    console.log('🔍 Applying filters...', {
      searchTerm,
      selectedGymType,
      selectedPrice,
      selectedEquipment,
      totalGyms: allGyms.length
    })

    let filtered = [...allGyms]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(term) ||
        gym.location.toLowerCase().includes(term) ||
        gym.gym_type.toLowerCase().includes(term) ||
        gym.equipment_type.toLowerCase().includes(term) ||
        gym.facilities.toLowerCase().includes(term) ||
        gym.price.toLowerCase().includes(term)
      )
    }

    if (selectedGymType !== 'All Types') {
      filtered = filtered.filter(gym =>
        gym.gym_type.toLowerCase().includes(selectedGymType.toLowerCase())
      )
    }

    if (selectedPrice !== 'All Prices') {
      if (selectedPrice === '100+') {
        // Filter for prices 100 and above
        filtered = filtered.filter(gym => {
          const priceNum = parseInt(gym.price)
          return !isNaN(priceNum) && priceNum >= 100
        })
      } else {
        // Filter for exact price match
        filtered = filtered.filter(gym => gym.price === selectedPrice)
      }
    }

    if (selectedEquipment !== 'All Equipment') {
      filtered = filtered.filter(gym =>
        gym.equipment_type.toLowerCase().includes(selectedEquipment.toLowerCase())
      )
    }

    console.log('📈 Filtering complete:', {
      before: allGyms.length,
      after: filtered.length
    })

    setFilteredGyms(filtered)
  }, [searchTerm, selectedGymType, selectedPrice, selectedEquipment, allGyms])

  const handleGymClick = (gymId: number) => {
    console.log('🎯 Navigating to gym:', gymId)
    router.visit(`/gyms/${gymId}`)
  }

  const getCurrentStatus = (openingHours: string): boolean => {
    try {
      console.log('🕒 Checking opening hours:', openingHours)

      // Parse the JSON string (it might be double-encoded)
      let hours;
      try {
        hours = JSON.parse(openingHours)
      } catch {
        // If first parse fails, try parsing again (in case it's double-encoded)
        hours = JSON.parse(JSON.parse(openingHours))
      }

      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
      const currentTime = now.getHours() * 100 + now.getMinutes()

      console.log('📅 Current day:', currentDay, 'Time:', currentTime)
      console.log('🏢 Gym hours for today:', hours[currentDay])

      if (hours[currentDay]) {
        const daySchedule = hours[currentDay]

        // Handle your format: {"Monday":{"open":true,"from":"06:00","to":"22:00"}}
        if (daySchedule.open) {
          const [openHours, openMinutes] = daySchedule.from.split(':').map(Number)
          const [closeHours, closeMinutes] = daySchedule.to.split(':').map(Number)

          const openTime = openHours * 100 + openMinutes
          const closeTime = closeHours * 100 + closeMinutes

          const isOpen = currentTime >= openTime && currentTime <= closeTime
          console.log('🚪 Gym status:', isOpen ? 'OPEN' : 'CLOSED')
          return isOpen
        }
      }

      console.log('🚪 Gym status: CLOSED (no schedule found)')
      return false
    } catch (error) {
      console.error('❌ Error parsing opening hours:', error)
      return false
    }
  }

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Find Your Perfect Gym</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search by location, gym type, equipment, or browse our curated collection
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

            {/* Gym Type Filter */}
            <div className="relative">
              <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedGymType}
                onChange={(e) => setSelectedGymType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {gymTypes.map((type) => (
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
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price === "All Prices" ? price : `$${price}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {equipmentTypes.map((equipment) => (
                  <option key={equipment} value={equipment}>
                    {equipment}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {/* <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Debug Info:</strong> Loaded {allGyms.length} gyms from server, showing {filteredGyms.length} after filters
          </div>
        </div> */}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            {error}
          </div>
        )}



        {/* Results Grid */}
        {!loading && filteredGyms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms.map((gym) => {
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
                    //   src={gym.main_image ? `/storage/${gym.main_image}` : "/placeholder.svg"}
                    // Replace all image src attributes with:
src={gym.main_image ? `/storage/${gym.main_image}` : "/placeholder.svg"}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {formatPrice(gym.price)}
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
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {gym.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Dumbbell size={16} />
                      <span>{gym.gym_type}</span>
                      <span>•</span>
                      <span>{gym.equipment_type}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{gym.location}</span>
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
        )}

        {/* No Results */}
        {!loading && filteredGyms.length === 0 && allGyms.length > 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No gyms found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        )}

        {/* No Gyms Available */}
        {!loading && allGyms.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No gyms available</h3>
            <p className="text-muted-foreground">Check back later for new gym listings</p>
          </div>
        )}
         {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-foreground">{filteredGyms.length}</span> gyms
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default GymSearch
