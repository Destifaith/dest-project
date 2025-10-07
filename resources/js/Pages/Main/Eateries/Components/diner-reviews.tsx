"use client"

import { Star, MapPin, Calendar } from "lucide-react"

const reviews = [
  {
    id: 1,
    dinerName: "Jessica Park",
    dinerImage: "/woman-smiling-diner.jpg",
    eateryName: "La Bella Vista",
    location: "Downtown",
    rating: 5,
    date: "2 days ago",
    review:
      "Absolutely incredible experience! The pasta was handmade and you could taste the quality in every bite. The ambiance was perfect for our anniversary dinner.",
    foodImage: "/italian-fine-dining-pasta-dish-with-wine.jpg",
    verified: true,
  },
  {
    id: 2,
    dinerName: "David Thompson",
    dinerImage: "/man-smiling-diner.jpg",
    eateryName: "Sakura Sushi House",
    location: "Midtown",
    rating: 5,
    date: "5 days ago",
    review:
      "The freshest sushi I've had outside of Japan. Chef's omakase was a journey through flavors. Every piece was perfectly crafted. Will definitely return!",
    foodImage: "/premium-sushi-omakase-platter.jpg",
    verified: true,
  },
  {
    id: 3,
    dinerName: "Maria Santos",
    dinerImage: "/woman-enjoying-food.jpg",
    eateryName: "The Garden Bistro",
    location: "Westside",
    rating: 4,
    date: "1 week ago",
    review:
      "Beautiful outdoor seating with amazing brunch options. The avocado toast was elevated to an art form. Great for weekend gatherings with friends.",
    foodImage: "/gourmet-brunch-avocado-toast-outdoor-setting.jpg",
    verified: true,
  },
  {
    id: 4,
    dinerName: "Alex Kumar",
    dinerImage: "/man-food-reviewer.jpg",
    eateryName: "Spice Route",
    location: "East Village",
    rating: 5,
    date: "1 week ago",
    review:
      "Authentic Indian flavors that reminded me of home. The butter chicken was rich and creamy, and the naan was perfectly charred. Service was exceptional too.",
    foodImage: "/authentic-indian-curry-with-naan.jpg",
    verified: true,
  },
]

export default function DinerReviews() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Recent Dining Experiences</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real reviews from real diners sharing their memorable moments
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={review.foodImage || "/placeholder.svg"}
                  alt={`Food from ${review.eateryName}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">{review.eateryName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{review.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-foreground/80 leading-relaxed mb-6">{review.review}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.dinerImage || "/placeholder.svg"}
                      alt={review.dinerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {review.dinerName}
                        {review.verified && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
            View All Reviews
          </button>
        </div>
      </div>
    </section>
  )
}
