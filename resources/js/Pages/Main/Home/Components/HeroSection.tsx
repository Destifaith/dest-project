import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Luxury Accommodations",
    subtitle: "Hotels & Airbnbs tailored for your comfort.",
    image:
      "/hotel.jpeg",
  },
  {
    id: 2,
    title: "Food & Drinks",
    subtitle: "Discover eateries, restaurants, pubs & lounges.",
    image: "/rest.jpg",
  },
  {
    id: 3,
    title: "Entertainment",
    subtitle: "Events, Beaches & Excursions await you.",
    image:
      "/events.jpeg",
  },
  {
    id: 4,
    title: "Fitness & Health",
    subtitle: "Relax at spas or stay fit at our gyms.",
    image:
      "/fitness.jpg",
  },
  {
    id: 5,
    title: "Jobs",
    subtitle: "Find hospitality opportunities that fit you.",
    image:
      "/jobs.jpg",
  },
];

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoPlay();
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    startAutoPlay();
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    startAutoPlay();
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-900 text-white overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-20" : "opacity-0 z-10"
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay with text */}
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center px-8 md:px-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full z-30"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full z-30"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Fixed Navigation Dots */}
            {/* Fixed Navigation Dots */}
      <div className="absolute top-1/3 right-6 -translate-y-1/2 flex flex-col space-y-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 border-2 transition-all duration-300 hover:scale-110 ${
              index === current
                ? "bg-green-500 border-green-500"
                : "bg-white/20 border-white hover:bg-white/40"
            }`}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroSection;
