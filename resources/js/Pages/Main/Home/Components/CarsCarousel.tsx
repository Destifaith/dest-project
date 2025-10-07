// CarsCarousel.tsx
"use client"
import * as React from "react"
import { Card, CardContent } from "@/Components/ui/card"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/Components/ui/carousel"

const defaultCars = [
  { id: 1, name: "Sedan 2024", main_image: { image_path: "default-car-1.jpg" }, price: "$100" },
  { id: 2, name: "SUV Adventure", main_image: { image_path: "default-car-2.jpg" }, price: "$150" },
  { id: 3, name: "Convertible Fun", main_image: { image_path: "default-car-3.jpg" }, price: "$200" },
]

export const CarsCarousel: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">Cars for Rent</h2>
        <p className="text-gray-500 mt-2">Find the perfect car for your trip</p>
      </div>

      <Carousel className="w-full" plugins={[Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {defaultCars.map((car) => (
            <CarouselItem key={car.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 relative">
                <img
                  src={`/storage/${car.main_image.image_path}`}
                  alt={car.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-600 bg-opacity-80 text-white text-xs font-semibold px-2 py-1 rounded transition duration-300 hover:bg-opacity-100">
                  {car.price}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{car.name}</h3>
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
