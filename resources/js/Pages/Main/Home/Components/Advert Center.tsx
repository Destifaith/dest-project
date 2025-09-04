import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ad {
  id: number;
  title: string;
  description: string;
  image: string;
}

const ads: Ad[] = [
  {
    id: 1,
    title: "Luxury Hotel Deals",
    description: "Book now and get 20% off on premium suites.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop",
  },
  {
    id: 2,
    title: "Exotic Food Festival",
    description: "Taste cuisines from all around the world.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop",
  },
  {
    id: 3,
    title: "Beach Party 2025",
    description: "Live DJs, cocktails, and sunset vibes.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
  },
  {
    id: 4,
    title: "Car Rental Promo",
    description: "Get the best cars at affordable prices.",
    image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&h=500&fit=crop",
  },
  {
    id: 5,
    title: "Spa & Wellness Retreat",
    description: "Relax and recharge with our spa packages.",
    image: "https://images.unsplash.com/photo-1556228453-efd1e5b04f28?w=800&h=500&fit=crop",
  },
  {
    id: 6,
    title: "Fitness Membership Offer",
    description: "Join now and get 2 months free at premium gyms.",
    image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&h=500&fit=crop",
  },
  {
    id: 7,
    title: "Wine & Lounge Night",
    description: "Exclusive wine tasting and live music lounge.",
    image: "https://images.unsplash.com/photo-1510626176961-4b37d6dc8a58?w=800&h=500&fit=crop",
  },
  {
    id: 8,
    title: "Adventure Excursions",
    description: "Safari, hiking, and guided city tours.",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=500&fit=crop",
  },
  {
    id: 9,
    title: "Hospitality Job Fair",
    description: "Connect with top employers in hospitality.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop",
  },
];

const AdvertCenter: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-switch ads every 30 seconds
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ads.length);
    }, 30000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleAdClick = (index: number) => {
    setActiveIndex(index);
    startAutoPlay();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column (Active Ad with animation) */}
      <div className="md:col-span-2 bg-white shadow-xl rounded-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={ads[activeIndex].id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <img
              src={ads[activeIndex].image}
              alt={ads[activeIndex].title}
              className="w-full h-72 md:h-[480px] object-cover"
            />
            <div className="p-6 bg-gradient-to-t from-black/60 to-transparent absolute bottom-0 left-0 right-0">
              <h3 className="text-2xl font-bold text-white drop-shadow-md">
                {ads[activeIndex].title}
              </h3>
              <p className="text-gray-200">{ads[activeIndex].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Column (Ad List) */}
      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {ads.map((ad, index) => (
          <div
            key={ad.id}
            onClick={() => handleAdClick(index)}
            className={`cursor-pointer flex items-center space-x-4 p-3 rounded-xl shadow-sm transition transform hover:scale-[1.02] ${
              index === activeIndex
                ? "bg-green-100 border-l-4 border-green-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <img
              src={ad.image}
              alt={ad.title}
              className="w-24 h-16 object-cover rounded-lg shadow"
            />
            <div>
              <h4 className="text-sm font-semibold text-gray-800">{ad.title}</h4>
              <p className="text-xs text-gray-500 truncate w-32">
                {ad.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvertCenter;
