// BeachHero.tsx
import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const images = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-2e90d8c3f5a6?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1493558103817-f77c73b0f6c2?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-87f0a74bba76?auto=format&fit=crop&w=1920&q=80",
]

const BeachHero: React.FC = () => {
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
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
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
              src={img}
              alt={`Beach ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Discover the Most Beautiful Beaches
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Explore, book, and experience breathtaking destinations by the sea
        </p>

      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2"
      >
        <ChevronLeft className="text-white" size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2"
      >
        <ChevronRight className="text-white" size={28} />
      </button>

      {/* Indicators (squares, bottom-left) */}
      <div className="absolute bottom-6 left-6 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 ${
              index === current ? "bg-white" : "bg-white/50"
            } transition-colors rounded-sm`}
          />
        ))}
      </div>
    </section>
  )
}

export default BeachHero
