import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  Home,
  BedDouble,
  Utensils,
  Music,
  Dumbbell,
  Briefcase,
  Hotel,
  Building2,
  Sandwich,
  UtensilsCrossed,
  Glasses,
  Calendar,
  Umbrella,
  Map,
  HeartPulse,
} from "lucide-react";

const MainNavbar: React.FC = () => {
  const { url } = usePage();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const isActive = (href: string) => url.startsWith(href);

  const menuItems = [
    {
      key: "accommodation",
      name: "Accommodation",
      icon: <BedDouble className="w-5 h-5" />,
      items: [
        { name: "Hotel", href: "/hotels", icon: <Hotel className="w-5 h-5" /> },
        { name: "Airbnb", href: "/airbnb", icon: <Building2 className="w-5 h-5" /> },
      ],
    },
    {
      key: "food",
      name: "Food & Drinks",
      icon: <Utensils className="w-5 h-5" />,
      items: [
        { name: "Restaurants", href: "/eateries", icon: <Sandwich className="w-5 h-5" /> },
        // { name: "Restaurants", href: "/restaurants", icon: <UtensilsCrossed className="w-5 h-5" /> },
        { name: "Pubs & Lounge", href: "/pubs", icon: <Glasses className="w-5 h-5" /> },
      ],
    },
    {
      key: "entertainment",
      name: "Entertainment",
      icon: <Music className="w-5 h-5" />,
      items: [
        { name: "Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
        { name: "Beach", href: "/beach", icon: <Umbrella className="w-5 h-5" /> },
        { name: "Excursion", href: "/excursion", icon: <Map className="w-5 h-5" /> },
      ],
    },
    {
      key: "fitness",
      name: "Fitness & Health",
      icon: <Dumbbell className="w-5 h-5" />,
      items: [
        { name: "Spa", href: "/spas-page", icon: <HeartPulse className="w-5 h-5" /> },
        { name: "Gym", href: "/gyms", icon: <Dumbbell className="w-5 h-5" /> },
      ],
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow w-full z-50 relative">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Hospitality
        </Link>

        {/* Menu */}
        <div className="flex items-center space-x-6">
          {/* Home */}
          <Link
            href="/"
            className={`hidden sm:flex ${
              isActive("/") ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-600 dark:text-gray-300"
            } hover:text-green-500`}
          >
            Home
          </Link>
          <Link
            href="/"
            className={`sm:hidden relative group ${
              isActive("/") ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-600 dark:text-gray-300"
            } hover:text-green-500`}
          >
            <Home className="w-6 h-6" />
            {/* Tooltip */}
            <span className="absolute left-1/2 -translate-x-1/2 top-8 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Home
            </span>
          </Link>

          {/* Dropdown Menus */}
          {menuItems.map((menu) => (
            <div key={menu.key} className="relative">
              {/* Desktop */}
              <button
                onClick={() => toggleDropdown(menu.key)}
                className={`hidden sm:flex ${
                  openDropdown === menu.key || menu.items.some((i) => isActive(i.href))
                    ? "text-green-600 dark:text-green-400 font-semibold"
                    : "text-gray-600 dark:text-gray-300"
                } hover:text-green-500`}
              >
                {menu.name}
              </button>

              {/* Mobile (icon only + tooltip) */}
              <button
                onClick={() => toggleDropdown(menu.key)}
                className={`sm:hidden relative group ${
                  openDropdown === menu.key || menu.items.some((i) => isActive(i.href))
                    ? "text-green-600 dark:text-green-400 font-semibold"
                    : "text-gray-600 dark:text-gray-300"
                } hover:text-green-500`}
              >
                {menu.icon}
                <span className="absolute left-1/2 -translate-x-1/2 top-8 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {menu.name}
                </span>
              </button>

              {/* Dropdown */}
              {openDropdown === menu.key && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                  {menu.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-2 ${
                        isActive(item.href)
                          ? "bg-green-50 dark:bg-gray-700 text-green-600 dark:text-green-400 font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Job */}
          <Link
            href="/jobs"
            className={`hidden sm:flex ${
              isActive("/jobs")
                ? "text-green-600 dark:text-green-400 font-semibold"
                : "text-gray-600 dark:text-gray-300"
            } hover:text-green-500`}
          >
            Job
          </Link>
          <Link
            href="/jobs"
            className={`sm:hidden relative group ${
              isActive("/jobs") ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-600 dark:text-gray-300"
            } hover:text-green-500`}
          >
            <Briefcase className="w-6 h-6" />
            <span className="absolute left-1/2 -translate-x-1/2 top-8 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Job
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
