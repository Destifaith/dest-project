"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const images = [
  "/tartinery_restaurant_s230411_3.webp",
  "/XXL_height.webp",
  "/traditional-korean-fermented-food-at-the-gwangjang-market-seoul-south-korea-PNAA4A.jpg",
  "/cultin.jpg",
  "/cultin2.jpg",
]

const EateryHero: React.FC = () => {
  const [current, setCurrent] = useState(0)

  // Auto slide every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Slides */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img || "/placeholder.svg"}
              alt={`Culinary experience ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-amber-950/40 to-amber-950/70" />
          </div>
        ))}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-balance">
          Discover Extraordinary Dining
        </h1>
        <p className="text-lg md:text-2xl mb-10 text-amber-50/90 font-light tracking-wide text-pretty max-w-3xl mx-auto">
          Explore curated eateries, reserve your table, and savor unforgettable culinary experiences
        </p>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-medium transition-all hover:scale-105 shadow-xl">
          Explore Restaurants
        </button>
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="text-white" size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="text-white" size={28} />
      </button>

      {/* Indicators (squares, bottom-left) */}
      <div className="absolute bottom-8 left-8 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 ${
              index === current ? "bg-white" : "bg-white/40"
            } transition-all rounded-sm hover:bg-white/70`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default EateryHero
