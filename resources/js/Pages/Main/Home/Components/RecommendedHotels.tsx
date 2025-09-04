"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/Components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel"

const hotels = [
  {
    id: 1,
    name: "Seaside Luxury Resort",
    location: "Miami Beach, FL",
    price: "$220/night",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
  },
  {
    id: 2,
    name: "Modern City Loft",
    location: "New York, NY",
    price: "$180/night",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop",
  },
  {
    id: 3,
    name: "Cozy Mountain Cabin",
    location: "Aspen, CO",
    price: "$150/night",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  },
  {
    id: 4,
    name: "Elegant Boutique Hotel",
    location: "Paris, France",
    price: "$240/night",
    image:
      "https://images.unsplash.com/photo-1559599238-589e8f876d89?w=800&h=600&fit=crop",
  },
  {
    id: 5,
    name: "Luxury Beachfront Villa",
    location: "Malibu, CA",
    price: "$350/night",
    image:
      "https://images.unsplash.com/photo-1560184897-ae75f4184934?w=800&h=600&fit=crop",
  },
]

export function RecommendedHotels() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Section Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Recommended Hotels & Airbnb
        </h2>
        <p className="text-gray-500 mt-2">
          Handpicked stays for your next unforgettable trip
        </p>
      </div>

      {/* Carousel with Autoplay + Pause on Hover */}
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000, // 5 seconds
            stopOnInteraction: true,
            stopOnMouseEnter: true, // 👈 pauses autoplay on hover
          }),
        ]}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {hotels.map((hotel) => (
            <CarouselItem
              key={hotel.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-gray-500">{hotel.location}</p>
                  <p className="text-green-600 font-bold mt-2">
                    {hotel.price}
                  </p>
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
