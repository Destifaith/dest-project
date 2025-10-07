// ExplorePlaces.tsx
import React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel"

const continents = [
  {
    name: "Africa",
    places: [
      {
        name: "Cape Town, South Africa",
        image: "https://images.unsplash.com/photo-1600019508301-285f6ebf9c4a?w=800&h=600&fit=crop",
      },
      {
        name: "Marrakech, Morocco",
        image: "https://images.unsplash.com/photo-1548786817-d1e6925f1d2e?w=800&h=600&fit=crop",
      },
      {
        name: "Accra, Ghana",
        image: "https://images.unsplash.com/photo-1585779034823-7a2fdfef9f4f?w=800&h=600&fit=crop",
      },
      {
        name: "Zanzibar, Tanzania",
        image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=600&fit=crop",
      },
    ],
  },
  {
    name: "Europe",
    places: [
      {
        name: "Paris, France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
      },
      {
        name: "Rome, Italy",
        image: "https://images.unsplash.com/photo-1526481280695-3c720685208b?w=800&h=600&fit=crop",
      },
      {
        name: "Barcelona, Spain",
        image: "https://images.unsplash.com/photo-1508599589926-58fdee0f9d4f?w=800&h=600&fit=crop",
      },
      {
        name: "Amsterdam, Netherlands",
        image: "https://images.unsplash.com/photo-1505060048268-2419cf8f0f36?w=800&h=600&fit=crop",
      },
    ],
  },
  {
    name: "Asia",
    places: [
      {
        name: "Tokyo, Japan",
        image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&h=600&fit=crop",
      },
      {
        name: "Bangkok, Thailand",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop",
      },
      {
        name: "Bali, Indonesia",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
      },
      {
        name: "Dubai, UAE",
        image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&h=600&fit=crop",
      },
    ],
  },
  {
    name: "America",
    places: [
      {
        name: "New York, USA",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      },
      {
        name: "Rio de Janeiro, Brazil",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      },
      {
        name: "Toronto, Canada",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      },
      {
        name: "Cancún, Mexico",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      },
    ],
  },
]

const ExplorePlaces: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Explore Your Place of Choice
        </h2>

        {continents.map((continent, index) => (
          <div key={index} className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {continent.name}
            </h3>
            <Carousel className="w-full">
              <CarouselContent>
                {continent.places.map((place, idx) => (
                  <CarouselItem
                    key={idx}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div className="p-2">
                      <div className="bg-white shadow rounded-lg overflow-hidden">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-gray-800">
                            {place.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ExplorePlaces
