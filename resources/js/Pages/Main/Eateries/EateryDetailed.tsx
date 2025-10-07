// resources/js/Pages/Main/Eatery/EateryDetailed.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle,
  Clock,
  Utensils,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  ChefHat,
  Calendar,
  Users,
  Clock as ClockIcon
} from "lucide-react";
import { router } from "@inertiajs/react";

// Layout
import MainLayout from "@/Pages/Layouts/MainLayout";

// Fix Leaflet icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface EateryMenu {
  id: number;
  menu_date: string;
  structured_menu: Record<string, Array<{ name: string; price: string }>>;
  extras?: Array<{ name: string; price: string }>;
}

interface Eatery {
  id: number;
  name: string;
  location?: string;
  description?: string;
  eatery_type?: string;
  cuisine_type?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  main_image?: string | null;
  gallery_images?: string[];
  opening_hours?: Record<string, any>;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  capacity?: number;
  features?: string[];
  reservation_policy?: string;
  price_range?: string;
  service_type?: string;
  has_daily_specials?: boolean;
  daily_specials_email?: string;
  owner_full_name?: string;
  owner_bio?: string;
  owner_experience_years?: number;
  owner_specialties?: string;
  owner_education?: string;
  owner_image?: string;
  awards?: Array<{
    id: string;
    title: string;
    description: string;
    year: string;
    image_path?: string;
  }>;
  daily_menus?: EateryMenu[];
}

interface Props extends PageProps {
  eatery?: Eatery;
}

const EateryDetailed: React.FC = () => {
  const { eatery } = usePage<Props>().props;
  useEffect(() => {
    console.log('=== EATERY DEBUG START ===');
    console.log('Full eatery object:', eatery);
    console.log('All keys in eatery:', eatery ? Object.keys(eatery) : 'eatery is null');
    console.log('eatery.daily_menus:', eatery?.daily_menus);
    console.log('eatery.dailyMenus:', (eatery as any)?.dailyMenus);
    console.log('=== EATERY DEBUG END ===');
  }, []);
  const [activeGalleryImageIndex, setActiveGalleryImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedMenuDate, setSelectedMenuDate] = useState<string>("");

  // User location + distance + times
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [times, setTimes] = useState<{ walking: string; bus: string; car: string } | null>(null);

  if (!eatery) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <p className="text-xl font-semibold text-gray-800">
              Loading eatery details…
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle location split
  let country = "Not specified";
  let city = "Not specified";

  if (eatery.location) {
    const parts = eatery.location.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      city = parts[1] || "Not specified";
      country = parts[2] || "Not specified";
    } else if (parts.length === 2) {
      city = parts[0];
      country = parts[1];
    } else {
      city = eatery.location;
    }
  }

  const lat = eatery.latitude ? parseFloat(String(eatery.latitude)) : 0;
  const lon = eatery.longitude ? parseFloat(String(eatery.longitude)) : 0;

  const galleryImages = eatery.gallery_images || [];
  const mainImage = eatery.main_image || "/storage/default-eatery.jpg";
  const currentGalleryImage = galleryImages[activeGalleryImageIndex] || "/storage/default-eatery.jpg";

  const features = eatery.features || [];
  const awards = eatery.awards || [];
  const openingHours = eatery.opening_hours || {};

  // Get menus directly from eatery props (comes from Laravel backend)
  const dailyMenus = eatery.daily_menus || [];

  // Set default selected menu to today's menu or most recent
  useEffect(() => {
    if (dailyMenus.length > 0 && !selectedMenuDate) {
      const today = new Date().toISOString().split('T')[0];
      const todayMenu = dailyMenus.find(menu => menu.menu_date === today);
      setSelectedMenuDate(todayMenu ? today : dailyMenus[0].menu_date);
    }
  }, [dailyMenus, selectedMenuDate]);

  const selectedMenu = dailyMenus.find(menu => menu.menu_date === selectedMenuDate);

  // Get user location + calculate distance and travel times
  useEffect(() => {
    if (navigator.geolocation && lat && lon) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;
          setUserLocation([userLat, userLon]);

          // Haversine formula
          const R = 6371; // km
          const dLat = (lat - userLat) * (Math.PI / 180);
          const dLon = (lon - userLon) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * (Math.PI / 180)) *
              Math.cos(lat * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c;
          setDistance(d);

          // Calculate times
          const walkingTime = d / 5; // 5 km/h
          const busTime = d / 40; // 40 km/h
          const carTime = d / 60; // 60 km/h

          const formatTime = (hours: number) => {
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            if (h > 0) return `${h}h ${m}m`;
            return `${m} min`;
          };

          setTimes({
            walking: formatTime(walkingTime),
            bus: formatTime(busTime),
            car: formatTime(carTime),
          });
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, [lat, lon]);

  // Format date for display
  const formatMenuDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { name: "DESCRIPTION", id: "description" },
    { name: "MENU", id: "menu" },
    { name: "AWARDS", id: "awards" },
    { name: "CHEF", id: "chef" },
    { name: "MAP", id: "map" },
    { name: "DETAILS", id: "details" },
    { name: "FACILITIES", id: "facilities" },
    { name: "REVIEWS", id: "reviews" },
    { name: "RESERVE", id: "reserve" },
  ];

  // NEW: Chef Section Component
  const ChefSection = () => (
    <div className="p-6 space-y-6">
      <div className="border rounded-lg p-8 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Chef Image */}
          {eatery.owner_image && (
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={eatery.owner_image}
                  alt={eatery.owner_full_name || "Chef"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          )}

          {/* Chef Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <h3 className="text-3xl font-bold text-gray-800">Meet Our Chef</h3>
            </div>

            {eatery.owner_full_name && (
              <h4 className="text-2xl font-semibold text-orange-700 mb-4">
                {eatery.owner_full_name}
              </h4>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {eatery.owner_experience_years && (
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-700">{eatery.owner_experience_years} Years</p>
                    <p className="text-sm text-gray-600">Culinary Experience</p>
                  </div>
                </div>
              )}

              {eatery.owner_education && (
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <Award className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-700">Education</p>
                    <p className="text-sm text-gray-600">{eatery.owner_education}</p>
                  </div>
                </div>
              )}
            </div>

            {eatery.owner_bio && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <h5 className="font-semibold text-gray-800 mb-3">Chef's Story</h5>
                <p className="text-gray-700 leading-relaxed">{eatery.owner_bio}</p>
              </div>
            )}

            {eatery.owner_specialties && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h5 className="font-semibold text-gray-800 mb-3">Specialties</h5>
                <p className="text-gray-700">{eatery.owner_specialties}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // NEW: Awards Section Component
  const AwardsSection = () => (
    <div className="p-6 space-y-6">
      <div className="border rounded-lg p-8 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <Award className="w-8 h-8 text-yellow-600" />
          <h3 className="text-3xl font-bold text-gray-800">Awards & Recognition</h3>
        </div>

        {awards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((award, index) => (
              <div
                key={award.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {award.image_path && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={award.image_path}
                      alt={award.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-800">{award.title}</h4>
                    {award.year && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {award.year}
                      </span>
                    )}
                  </div>
                  {award.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{award.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No awards listed yet</p>
            <p className="text-gray-400">Check back later for updates!</p>
          </div>
        )}
      </div>
    </div>
  );

  // UPDATED: Menu Section Component (simplified - no loading state needed)
 // UPDATED: Menu Section Component with Accordion
  const MenuSection = () => {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (section: string) => {
      setExpandedSections(prev =>
        prev.includes(section)
          ? prev.filter(s => s !== section)
          : [...prev, section]
      );
    };

    return (
      <div className="p-6 space-y-6">
        {/* Menu Date Selector */}
        {dailyMenus.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">Select Menu Date</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {dailyMenus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenuDate(menu.menu_date)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedMenuDate === menu.menu_date
                      ? 'bg-green-600 text-white border-green-600 shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-green-400'
                  }`}
                >
                  {formatMenuDate(menu.menu_date)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Display */}
        {selectedMenu ? (
          <div className="space-y-4">
            {/* Main Menu Sections - Accordion Style */}
            <div className="space-y-3">
              {Object.entries(selectedMenu.structured_menu).map(([section, items]) => (
                <div
                  key={section}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    <h3 className="text-xl font-bold text-white">{section}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
                        {items.length} items
                      </span>
                      <svg
                        className={`w-6 h-6 text-white transition-transform duration-300 ${
                          expandedSections.includes(section) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {expandedSections.includes(section) && (
                    <div className="p-4 space-y-2 bg-gray-50">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 rounded-lg bg-white hover:bg-green-50 transition-colors duration-200 border border-gray-100 shadow-sm"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-700 text-lg">{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Extras Section - Also Accordion */}
            {selectedMenu.extras && selectedMenu.extras.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-purple-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('extras')}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Extra Add-ons</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
                      {selectedMenu.extras.length} items
                    </span>
                    <svg
                      className={`w-6 h-6 text-white transition-transform duration-300 ${
                        expandedSections.includes('extras') ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.includes('extras') && (
                  <div className="p-4 space-y-2 bg-purple-50">
                    {selectedMenu.extras.map((extra, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 rounded-lg bg-white hover:bg-purple-50 transition-colors duration-200 border border-purple-100 shadow-sm"
                      >
                        <h4 className="font-semibold text-gray-800">{extra.name}</h4>
                        <span className="font-bold text-purple-700 text-lg">{extra.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <ClockIcon className="w-5 h-5" />
                <p className="text-sm font-semibold">
                  Menu for {formatMenuDate(selectedMenu.menu_date)}
                </p>
              </div>
            </div>
          </div>
        ) : eatery.has_daily_specials ? (
          <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <Utensils className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Daily Specials Available!</h3>
            <p className="text-gray-600 mb-4">Contact us for today's fresh menu</p>
            {eatery.daily_specials_email && (
              <a
                href={`mailto:${eatery.daily_specials_email}`}
                className="inline-flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
                Email for Today's Menu
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Menu Coming Soon</h3>
            <p className="text-gray-600">We're preparing something delicious for you!</p>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">About {eatery.name}</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{eatery.description}</p>
          </div>
        );
      case "menu":
        return <MenuSection />;
      case "awards":
        return <AwardsSection />;
      case "chef":
        return <ChefSection />;
      case "map":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold mb-4">Location Map</h3>
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-inner">
              <MapContainer
                center={[lat, lon]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                className="rounded-lg"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Eatery marker */}
                <Marker position={[lat, lon]}>
                  <Popup>{eatery.name}</Popup>
                </Marker>

                {/* User marker */}
                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}

                {/* Route line */}
                {userLocation && (
                  <Polyline
                    positions={[userLocation, [lat, lon]]}
                    color="blue"
                    weight={4}
                  />
                )}
              </MapContainer>
            </div>

            {/* Distance Info + Times */}
            {distance && (
              <div className="space-y-2 text-gray-700">
                <p>
                  Distance to restaurant:{" "}
                  <span className="font-bold">{distance.toFixed(2)} km</span>
                </p>
                {times && (
                  <>
                    <p>🚶 Walking: <span className="font-bold">{times.walking}</span></p>
                    <p>🚌 Bus: <span className="font-bold">{times.bus}</span></p>
                    <p>🚗 Car: <span className="font-bold">{times.car}</span></p>
                  </>
                )}
              </div>
            )}
          </div>
        );
      case "details":
        return (
          <div className="p-6 space-y-6">
            <div className="border rounded-lg p-6 shadow-sm bg-gray-50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Eatery Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Basic Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Utensils size={24} className="text-orange-500" />
                    <div>
                      <h4 className="font-bold text-lg">General Information</h4>
                      <p className="text-sm">Explore the fundamental characteristics.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Name:</span>
                      <span>{eatery.name}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Type:</span>
                      <span>{eatery.eatery_type || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Cuisine:</span>
                      <span>{eatery.cuisine_type || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Country:</span>
                      <span>{country}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">City:</span>
                      <span>{city}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Price Range:</span>
                      <span>{eatery.price_range || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Service:</span>
                      <span>{eatery.service_type || "Not specified"}</span>
                    </li>
                    {eatery.capacity && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24">Capacity:</span>
                        <span>{eatery.capacity} people</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Column 2: Contact & Travel Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Phone size={24} className="text-green-500" />
                    <div>
                      <h4 className="font-bold text-lg">Contact & Travel</h4>
                      <p className="text-sm">Get in touch and plan your visit.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    {eatery.contact_phone && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24">Phone:</span>
                        <span>{eatery.contact_phone}</span>
                      </li>
                    )}
                    {eatery.contact_email && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24">Email:</span>
                        <span>{eatery.contact_email}</span>
                      </li>
                    )}
                    {eatery.website && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24">Website:</span>
                        <a href={eatery.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          Visit Website
                        </a>
                      </li>
                    )}
                    {distance && (
                      <>
                        <li className="flex items-center space-x-2">
                          <span className="font-semibold w-24">Distance:</span>
                          <span>{distance.toFixed(2)} km</span>
                        </li>
                      </>
                    )}
                  </ul>
                  {times && (
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center space-x-3 text-gray-700">
                        <Clock size={24} className="text-purple-500" />
                        <div>
                          <h4 className="font-bold text-lg">Estimated Travel Time</h4>
                          <p className="text-sm">From your current location.</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-semibold">🚶 Walking:</span> {times.walking}</li>
                        <li><span className="font-semibold">🚌 Bus:</span> {times.bus}</li>
                        <li><span className="font-semibold">🚗 Car:</span> {times.car}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            {Object.keys(openingHours).length > 0 && (
              <div className="border rounded-lg p-6 shadow-sm bg-white">
                <h4 className="text-xl font-bold mb-4">Opening Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-gray-800">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center border-b pb-2">
                      <span className="font-semibold capitalize">{day}:</span>
                      {hours.isOpen ? (
                        <span className="text-green-600">
                          {hours.openTime} - {hours.closeTime}
                        </span>
                      ) : (
                        <span className="text-red-600">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "facilities":
        return (
          <div className="p-6 space-y-6">
            <div className="border rounded-lg p-6 shadow-sm bg-gray-50">
              <h3 className="text-xl font-bold mb-4">Features & Facilities</h3>
              {features.length > 0 ? (
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-gray-700"
                    >
                      <CheckCircle className="text-green-500 w-5 h-5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No features listed.</p>
              )}
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
            <p className="text-gray-600">
              This section will display customer reviews and ratings.
            </p>
          </div>
        );
      case "reserve":
        return (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border rounded-lg p-6 shadow-sm bg-gray-50">
              {/* Main Image */}
              <div className="w-full md:w-1/2 h-64 rounded-lg overflow-hidden shadow-md">
                <img
                  src={mainImage}
                  alt={eatery.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold">{eatery.name}</h3>
                <p className="text-gray-500">
                  {city}, {country}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-500">
                    <strong>Cuisine:</strong> {eatery.cuisine_type || "Not specified"}
                  </p>
                  <p className="text-gray-500">
                    <strong>Price Range:</strong>{" "}
                    <span className="text-green-600 font-bold">{eatery.price_range}</span>
                  </p>
                  {eatery.reservation_policy && (
                    <p className="text-gray-500">
                      <strong>Reservation Policy:</strong> {eatery.reservation_policy}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.visit(`/eatery-reservation?id=${eatery.id}`)}
                  className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
                >
                  Make Reservation
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-md">
                <img
                  src={currentGalleryImage}
                  alt={`Gallery main view ${activeGalleryImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`thumb-${index}`}
                      className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out
                        ${
                          index === activeGalleryImageIndex
                            ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                            : "hover:scale-105"
                        }`}
                      onClick={() => setActiveGalleryImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="flex flex-wrap border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`py-4 px-6 font-semibold transition-colors duration-200
                        ${
                          activeTab === tab.id
                            ? "text-white bg-green-500"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
                <div className="pt-4">{renderTabContent()}</div>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={eatery.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{eatery.name}</h2>
                    <p className="text-gray-500 text-sm">
                      {city}, {country}
                    </p>
                    <div className="flex items-center mt-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-600">4.5 (128 reviews)</span>
                    </div>
                  </div>

                  {/* Eatery Info */}
                  <div className="space-y-2 py-2 border-b border-gray-200">
                    <p className="flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-600">Type:</span>
                      <span>{eatery.eatery_type || "Not specified"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-600">Cuisine:</span>
                      <span>{eatery.cuisine_type || "Not specified"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-600">Price Range:</span>
                      <span className="text-green-600 font-bold">{eatery.price_range}</span>
                    </p>
                    {eatery.service_type && (
                      <p className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-600">Service:</span>
                        <span>{eatery.service_type}</span>
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(eatery.contact_phone || eatery.contact_email || eatery.website) && (
                    <div className="space-y-2 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-700">Contact Information</h4>
                      {eatery.contact_phone && (
                       <p className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-800">
  <Phone className="w-4 h-4 text-gray-900 dark:text-gray-800" />
  <span>{eatery.contact_phone}</span>
</p>
                      )}
                      {eatery.contact_email && (
                        <p className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-800">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span>{eatery.contact_email}</span>
                        </p>
                      )}
                      {eatery.website && (
                        <p className="flex items-center space-x-2 text-sm">
                          <Globe className="w-4 h-4 text-gray-600" />
                          <a href={eatery.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            Visit Website
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Make Reservation */}
                  <button
                    onClick={() => router.visit(`/eatery-reservation?id=${eatery.id}`)}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-md mt-4 transition-colors duration-200 hover:bg-green-700"
                  >
                    MAKE RESERVATION
                  </button>

                  {/* Help Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Need Hospitality Answer Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      We would be more than happy to help you. Our Account
                      Manager are 24/7 at your service to help you.
                    </p>
                    <div className="text-blue-500 font-bold text-lg">
                      📞 +233-247-94-3218
                    </div>
                    <div className="text-gray-600 text-sm">
                      ✉️ info@hospitalityanswer.com
                    </div>
                  </div>

                  {/* Why Book With Us */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-700 mb-4">
                      Why Book with us?
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-4">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 text-lg">🌍</span>
                        <span>
                          <span className="font-semibold">African Focus</span>
                          <br />
                          Direct Provider of Travel Products in Africa
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-yellow-500 text-lg">💰</span>
                        <span>
                          <span className="font-semibold">
                            Low Rate & Guarantee
                          </span>
                          <br />
                          Cheaper Rate, Super Deals and Guaranteed Payment.
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 text-lg">🤝</span>
                        <span>
                          <span className="font-semibold">
                            After Sales Support
                          </span>
                          <br />
                          We care about your booking and follow through for
                          Service Delivery
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EateryDetailed;
