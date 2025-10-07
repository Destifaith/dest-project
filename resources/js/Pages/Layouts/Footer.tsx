// Footer.tsx
import React from "react"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Mail } from "lucide-react"

const paymentMethods = [
  { src: "/images/payments/visa.webp", alt: "Visa" },
  { src: "/images/payments/master.png", alt: "MasterCard" },
  { src: "/images/payments/mtn.png", alt: "MTN" },
  { src: "/images/payments/t-cash.png", alt: "T-Cash" },
  { src: "/images/payments/airteltigo-money-logo.jpg", alt: "AirtelTigo Money" },
  // Add more logos here in the future
]

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand & About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Hospitality Answer</h2>
          <p className="text-sm leading-relaxed">
            Your one-stop solution for booking hotels, exploring eateries,
            beaches, and renting cars. We make your travel experience seamless.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/beach" className="hover:text-white">Beaches</a></li>
            <li><a href="#" className="hover:text-white">Hotels</a></li>
            <li><a href="#" className="hover:text-white">Eateries</a></li>
            <li><a href="#" className="hover:text-white">Cars for Rent</a></li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">We Accept</h3>
          <div className="flex flex-wrap gap-4 items-center">
            {paymentMethods.map((method, index) => (
              <img
                key={index}
                src={method.src}
                alt={method.alt}
                className="h-10 object-contain hover:opacity-80 transition"
              />
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
          <p className="text-sm mb-3">Subscribe to get exclusive offers and travel deals.</p>
          <form className="flex items-center space-x-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              <Mail className="h-4 w-4 mr-1" /> Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Hospitality Answer. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
