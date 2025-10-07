import { ChefHat, Utensils, Coffee, Pizza, Fish, Soup, IceCream } from "lucide-react"
import { Link } from "@inertiajs/react"
import { useState, useEffect } from "react"

// Icon mapping for different cuisines - expanded with more variations
const cuisineIcons: { [key: string]: any } = {
  'Italian': Pizza,
  'Japanese': Fish,
  'French': ChefHat,
  'Mexican': Soup,
  'American': Utensils,
  'Cafe': Coffee,
  'Chinese': Soup,
  'Indian': ChefHat,
  'Thai': Soup,
  'Mediterranean': ChefHat,
  'Dessert': IceCream,
  'Desserts': IceCream, // Add plural version
  'default': Utensils
}

// Default images for cuisines - using placeholder or local images
const cuisineImages: { [key: string]: string } = {
  'Italian': '/italian.jpg',
  'Japanese': '/japan.jpeg',
  'French': '/french.webp',
  'Mexican': '/mexican.jpeg',
  'American': '/gourmet-burger-with-fries.jpg',
  'Cafe': '/cozy-cafe-brunch-spread-with-coffee.jpg',
  'Chinese': '/chine.jpg',
  'Indian': '/indian-curry-with-naan-bread.jpg',
  'Thai': '/thai-tom-yum-soup.jpg',
  'Mediterranean': '/mediterranean-meze-platter.jpg',
  'Dessert': '/dessert.jpg',
  'Desserts': '/dessert.jpg', // Add plural version
  'default': '/placeholder.svg' // Use placeholder instead of default.jpg
}

interface CuisineCategory {
  name: string
  icon: any
  image: string
  count: number
  description: string
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<CuisineCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Descriptions for different cuisines
  const cuisineDescriptions: { [key: string]: string } = {
    'Italian': 'Authentic pasta, pizza & more',
    'Japanese': 'Sushi, ramen & traditional dishes',
    'French': 'Fine dining & bistro classics',
    'Mexican': 'Tacos, burritos & authentic flavors',
    'American': 'Burgers, steaks & comfort food',
    'Cafe': 'Coffee, pastries & breakfast',
    'Chinese': 'Dim sum, noodles & wok dishes',
    'Indian': 'Curries, biryani & tandoori specialties',
    'Thai': 'Spicy curries, noodles & street food',
    'Mediterranean': 'Fresh salads, grilled meats & mezze',
    'Dessert': 'Sweet treats, cakes & pastries',
    'Desserts': 'Sweet treats, cakes & pastries' // Add plural version
  }

  // Function to normalize cuisine names
  const normalizeCuisineName = (cuisine: string): string => {
    const normalized = cuisine.trim()

    // Handle common variations
    const variations: { [key: string]: string } = {
      'desserts': 'Dessert',
      'dessert': 'Dessert',
      'italian': 'Italian',
      'japanese': 'Japanese',
      'french': 'French',
      'mexican': 'Mexican',
      'american': 'American',
      'cafe': 'Cafe',
      'chinese': 'Chinese',
      'indian': 'Indian',
      'thai': 'Thai',
      'mediterranean': 'Mediterranean'
    }

    return variations[normalized.toLowerCase()] || normalized
  }

  useEffect(() => {
    const fetchCuisineData = async () => {
      try {
        setLoading(true)

        // Use the correct endpoint with proper headers
        const response = await fetch('/api/eateries/all', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.log('Non-JSON response:', text.substring(0, 200))
          throw new Error('Server returned non-JSON response')
        }

        const data = await response.json()
        console.log('API response data:', data)

        // Handle the response format
        let eateriesData = data.data || data.eateries || data

        if (!Array.isArray(eateriesData)) {
          console.log('Response data is not an array:', eateriesData)
          setCategories([])
          return
        }

        // Group eateries by normalized cuisine type and count them
        const cuisineCounts: { [key: string]: number } = {}

        eateriesData.forEach((eatery: any) => {
          if (eatery.cuisine_type) {
            const normalizedCuisine = normalizeCuisineName(eatery.cuisine_type)
            cuisineCounts[normalizedCuisine] = (cuisineCounts[normalizedCuisine] || 0) + 1
          }
        })

        // Debug: Log the cuisine counts to see what's in the database
        console.log('Cuisine counts from database:', cuisineCounts)

        // Transform data for the component
        const cuisineCategories: CuisineCategory[] = Object.entries(cuisineCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([cuisineName, count]) => {
            const normalizedCuisine = cuisineName.trim()
            const IconComponent = cuisineIcons[normalizedCuisine] || cuisineIcons.default
            const image = cuisineImages[normalizedCuisine] || cuisineImages.default
            const description = cuisineDescriptions[normalizedCuisine] || `${normalizedCuisine} restaurants & cuisine`

            return {
              name: normalizedCuisine,
              icon: IconComponent,
              image,
              count: count as number,
              description
            }
          })

        setCategories(cuisineCategories)

      } catch (err) {
        console.error('Error fetching cuisine data:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(`Failed to load cuisine categories: ${errorMessage}`)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCuisineData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">Explore by Cuisine</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Loading cuisine categories...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error && categories.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">Explore by Cuisine</h2>
            <p className="text-destructive text-lg">{error}</p>
            <p className="text-muted-foreground text-sm mt-2">
              Check the browser console for more details
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">Explore by Cuisine</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No cuisine categories available yet. Add some eateries with cuisine types to see them here.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">Explore by Cuisine</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover your next favorite dining experience from our curated selection of world cuisines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.name}
                href={`/eateries?cuisine=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted transition-transform duration-300 hover:scale-[1.02] block"
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-300 group-hover:from-black/90" />
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-white mb-0.5">{category.name}</h3>
                      <p className="text-white/70 text-sm">{category.count} {category.count === 1 ? 'restaurant' : 'restaurants'}</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{category.description}</p>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
