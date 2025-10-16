"use client"

import { Heart, Award, Users, Clock4, Dumbbell, Star } from "lucide-react"
import { router } from '@inertiajs/react'

const GymBenefits = () => {
  const gymBenefits = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Improved Heart Health",
      description: "Regular exercise strengthens your heart and improves circulation, reducing the risk of heart disease."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Increased Strength",
      description: "Build muscle mass, improve bone density, and enhance overall physical performance."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Support",
      description: "Join a community of like-minded fitness enthusiasts for motivation and accountability."
    },
    {
      icon: <Clock4 className="w-8 h-8" />,
      title: "Better Sleep",
      description: "Regular physical activity helps regulate sleep patterns for more restful nights."
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Mental Clarity",
      description: "Reduce stress, anxiety, and improve mental focus through consistent exercise."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Confidence Boost",
      description: "Achieve your fitness goals and build self-confidence through measurable progress."
    }
  ]

  const handleBrowseGyms = () => {
    router.visit('/gyms')
  }

  const handleLearnMore = () => {
    // You can add a scroll to a specific section or navigate to a learn more page
    const element = document.getElementById('gym-categories')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why Join a Gym?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the transformative benefits of regular exercise and how joining the right gym can change your life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gymBenefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border group"
            >
              <div className="text-primary mb-4 flex justify-center">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground text-center">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 bg-card rounded-2xl p-8 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your fitness journey today. Find the perfect gym that matches your goals and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBrowseGyms}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse All Gyms
            </button>
            <button
              onClick={handleLearnMore}
              className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GymBenefits
