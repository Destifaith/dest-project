"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Food Enthusiast",
    image: "/professional-woman-smiling.png",
    rating: 5,
    quote:
      "This platform has completely transformed how I discover new restaurants. The curated selections are always spot-on, and I've found some absolute gems I would have never known about otherwise.",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Restaurant Owner",
    image: "/professional-asian-man-chef.jpg",
    rating: 5,
    quote:
      "As a restaurant owner, being featured here has brought incredible visibility to our establishment. The quality of diners we attract through this platform is outstanding.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Travel Blogger",
    image: "/professional-woman-travel-blogger.jpg",
    rating: 5,
    quote:
      "I travel constantly for work, and this is my go-to resource in every city. The filters are intuitive, the recommendations are reliable, and I always find exactly what I'm craving.",
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">What Our Community Says</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of food lovers who trust us to discover their next favorite dining experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              <blockquote className="text-foreground/90 leading-relaxed mb-8 font-serif text-lg">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
