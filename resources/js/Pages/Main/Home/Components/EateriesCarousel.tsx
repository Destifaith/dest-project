// EateriesCarousel.tsx
"use client"
import * as React from "react"
import { Card, CardContent } from "@/Components/ui/card"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/Components/ui/carousel"

const defaultEateries = [
  {
    id: 1,
    name: "Oceanview Diner",
    main_image: { image_path: "default-eatery-1.jpg" },
  },
  {
    id: 2,
    name: "Mountain Grill",
    main_image: { image_path: "default-eatery-2.jpg" },
  },
  {
    id: 3,
    name: "City Bistro",
    main_image: { image_path: "default-eatery-3.jpg" },
  },
]

export const EateriesCarousel: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">Eateries Near You</h2>
        <p className="text-gray-500 mt-2">Discover great places to eat</p>
      </div>

      <Carousel className="w-full" plugins={[Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {defaultEateries.map((eatery) => (
            <CarouselItem key={eatery.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
                <img
                  src={`/storage/${eatery.main_image.image_path}`}
                  alt={eatery.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{eatery.name}</h3>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-white shadow-md hover:bg-gray-100" />
        <CarouselNext className="bg-white shadow-md hover:bg-gray-100" />
      </Carousel>
    </section>
  )
}
