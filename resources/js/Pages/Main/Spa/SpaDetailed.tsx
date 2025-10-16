// resources/js/Pages/Main/Spa/SpaDetailed.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle,
  Clock,
  Heart,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Sparkles,
  Leaf,
  Waves,
  Moon,
  Sun
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

interface SpaTreatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
  benefits: string[];
  therapist: string;
}

interface Spa {
  id: number;
  name: string;
  location?: string;
  description?: string;
  treatment_type?: string;
  ambiance_type?: string;
  price: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  main_image?: string | null;
  gallery_images?: string[];
  opening_hours?: Record<string, any>;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  facilities?: string[];
  treatment_packages?: Array<{
    name: string;
    price: string;
    duration: string;
    includes: string[];
    description: string;
  }>;
  treatments?: SpaTreatment[];
  established_year?: number;
  has_thermal_facilities?: boolean;
  has_wellness_programs?: boolean;
  has_couples_retreat?: boolean;
  has_meditation?: boolean;
  has_yoga?: boolean;
  has_detox_programs?: boolean;
}

interface Props extends PageProps {
  spa?: Spa;
}

const SpaDetailed: React.FC = () => {
  const { spa } = usePage<Props>().props;
  const [activeGalleryImageIndex, setActiveGalleryImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("treatments");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<SpaTreatment | null>(null);

  // Image URL helper function
  const getImageUrl = (imagePath: string | undefined | null, fallback: string = "/storage/default-spa.jpg"): string => {
    if (!imagePath) return fallback;

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    return `/storage/${imagePath}`;
  };

  // Debug: Log spa data
  useEffect(() => {
    console.log("🧖 SpaDetailed Component Mounted");
    console.log("📦 Full Spa Data:", spa);

    if (spa) {
      console.log("🆔 Spa ID:", spa.id);
      console.log("🏷️ Spa Name:", spa.name);
      console.log("📍 Location:", spa.location);
      console.log("💰 Price:", spa.price);
      console.log("🎯 Treatments Count:", spa.treatments?.length || 0);
    }
  }, [spa]);

  if (!spa) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-rose-50">
          <div className="p-8 bg-white rounded-2xl shadow-lg border border-green-200">
            <div className="animate-pulse flex items-center space-x-4">
              <Sparkles className="w-8 h-8 text-green-600" />
              <p className="text-xl font-light text-gray-700">
                Loading spa details…
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle location split
  let country = "Not specified";
  let city = "Not specified";

  if (spa.location) {
    const parts = spa.location.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      city = parts[1] || "Not specified";
      country = parts[2] || "Not specified";
    } else if (parts.length === 2) {
      city = parts[0];
      country = parts[1];
    } else {
      city = spa.location;
    }
  }

  const lat = spa.latitude ? parseFloat(String(spa.latitude)) : 0;
  const lon = spa.longitude ? parseFloat(String(spa.longitude)) : 0;

  // Get image URLs
  const galleryImages = spa.gallery_images ? spa.gallery_images.map(img => getImageUrl(img)) : [];
  const mainImage = getImageUrl(spa.main_image);
  const currentGalleryImage = galleryImages[activeGalleryImageIndex] || "/storage/default-spa.jpg";

  const facilities = spa.facilities || [];
  const openingHours = spa.opening_hours || {};
  const treatments = spa.treatments || [];
  const treatmentPackages = spa.treatment_packages || [];

  // Get user location + calculate distance
  useEffect(() => {
    if (navigator.geolocation && lat && lon) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;
          setUserLocation([userLat, userLon]);

          // Calculate distance
          const R = 6371;
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
        },
        (err) => {
          console.error("Location error:", err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [lat, lon]);

  // Format price for display
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price);
    if (isNaN(priceNum)) return price;
    return `$${price}`;
  };

  const tabs = [
    { name: "TREATMENTS", id: "treatments", icon: "✨" },
    { name: "PACKAGES", id: "packages", icon: "🎁" },
    { name: "FACILITIES", id: "facilities", icon: "🏛️" },
    { name: "AMBIANCE", id: "ambiance", icon: "🌿" },
    { name: "LOCATION", id: "location", icon: "📍" },
    { name: "BOOK NOW", id: "book", icon: "📅" },
  ];

  // Treatments Section Component
  const TreatmentsSection = () => (
    <div className="p-6 space-y-6">
      <div className="border border-green-200 rounded-2xl p-8 bg-gradient-to-br from-white to-green-50 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-green-600" />
          <h3 className="text-3xl font-light text-gray-800">Wellness Treatments</h3>
        </div>

        {treatments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedTreatment(treatment)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-xl text-gray-800">{treatment.name}</h4>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {treatment.duration}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{treatment.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-700 font-bold text-lg">{formatPrice(treatment.price)}</span>
                  <span className="text-sm text-gray-500">with {treatment.therapist}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {treatment.benefits.slice(0, 3).map((benefit, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No treatments available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );

  // Treatment Modal
  const TreatmentModal = () => {
    if (!selectedTreatment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-light text-gray-800">{selectedTreatment.name}</h3>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Duration:</span>
                  <p className="text-gray-600">{selectedTreatment.duration}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Therapist:</span>
                  <p className="text-gray-600">{selectedTreatment.therapist}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Category:</span>
                  <p className="text-gray-600">{selectedTreatment.category}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Price:</span>
                  <p className="text-green-700 font-bold">{formatPrice(selectedTreatment.price)}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{selectedTreatment.description}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Benefits:</span>
                <ul className="mt-2 space-y-1">
                  {selectedTreatment.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => router.visit(`/spa-booking?id=${spa.id}&treatment=${selectedTreatment.id}`)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mt-6"
              >
                Book This Treatment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "treatments":
        return <TreatmentsSection />;
      case "packages":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-green-200 rounded-2xl p-8 bg-gradient-to-br from-white to-rose-50 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🎁</span>
                <h3 className="text-3xl font-light text-gray-800">Wellness Packages</h3>
              </div>

              {treatmentPackages.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {treatmentPackages.map((pkg, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300"
                    >
                      <h4 className="font-semibold text-xl text-gray-800 mb-3">{pkg.name}</h4>
                      <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                      <div className="mb-4">
                        <span className="text-green-700 font-bold text-lg">{formatPrice(pkg.price)}</span>
                        <span className="text-gray-500 text-sm ml-2">• {pkg.duration}</span>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {pkg.includes.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => router.visit(`/spa-booking?id=${spa.id}&package=${index}`)}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Book Package
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4">🎁</span>
                  <p className="text-gray-500 text-lg">No packages available at the moment</p>
                </div>
              )}
            </div>
          </div>
        );
      case "facilities":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-green-200 rounded-2xl p-6 shadow-sm bg-white">
              <h3 className="text-2xl font-light mb-6 text-gray-800">Spa Facilities</h3>
              {facilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No facilities listed.</p>
              )}
            </div>
          </div>
        );
      case "ambiance":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-green-200 rounded-2xl p-8 bg-gradient-to-br from-white to-green-50 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <Leaf className="w-8 h-8 text-green-600" />
                <h3 className="text-3xl font-light text-gray-800">Spa Ambiance</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Atmosphere</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Experience pure tranquility in our {spa.ambiance_type?.toLowerCase()} designed space.
                      Every detail is crafted to promote relaxation and wellness.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Wellness Philosophy</h4>
                    <p className="text-gray-600 leading-relaxed">
                      We believe in holistic healing that nurtures mind, body, and spirit.
                      Our treatments are designed to restore balance and promote inner peace.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Sensory Experience</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <Waves className="w-4 h-4 text-blue-500 mr-2" />
                        Soothing water features and calming sounds
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">🌿</span>
                        Natural aromatherapy and essential oils
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✨</span>
                        Soft lighting and serene color palettes
                      </li>
                    </ul>
                  </div>

                  {spa.established_year && (
                    <div className="bg-white rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800">Established</h4>
                          <p className="text-2xl font-light text-purple-600">{spa.established_year}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "location":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-green-200 rounded-2xl p-6 shadow-sm bg-white">
              <h3 className="text-2xl font-light mb-4 text-gray-800">Location & Directions</h3>

              <div className="h-96 rounded-lg overflow-hidden shadow-inner border border-green-200 mb-6">
                <MapContainer
                  center={[lat, lon]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  className="rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[lat, lon]}>
                    <Popup className="text-gray-800">
                      <div className="font-semibold">{spa.name}</div>
                      <div className="text-sm text-gray-600">{spa.location}</div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-2">📍 Location Details</h4>
                <p className="text-gray-700">{spa.location}</p>
                {distance && (
                  <p className="text-green-700 mt-2">
                    <span className="font-semibold">{distance.toFixed(2)} km</span> from your location
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case "book":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-green-200 rounded-2xl p-8 bg-gradient-to-br from-white to-green-50 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-8 h-8 text-green-600" />
                <h3 className="text-3xl font-light text-gray-800">Book Your Wellness Journey</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4">Quick Booking</h4>
                    <button
                      onClick={() => router.visit(`/spa-booking?id=${spa.id}`)}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors mb-4"
                    >
                      Book Consultation
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Let our wellness experts guide you to the perfect treatment
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Contact Us</h4>
                    <div className="space-y-3 text-gray-600">
                      {spa.contact_phone && (
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {spa.contact_phone}
                        </p>
                      )}
                      {spa.contact_email && (
                        <p className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {spa.contact_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-green-200">
                  <h4 className="font-semibold text-lg text-gray-800 mb-4">Why Choose {spa.name}?</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Certified wellness therapists
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Natural and organic products
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Personalized treatment plans
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Serene and healing environment
                    </li>
                  </ul>
                </div>
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
      <div className="bg-gradient-to-br from-green-50 to-rose-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-green-200">
                <img
                  src={currentGalleryImage}
                  alt={`Spa gallery view ${activeGalleryImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`thumb-${index}`}
                      className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out border-2
                        ${
                          index === activeGalleryImageIndex
                            ? "border-green-500 ring-2 ring-green-500 ring-offset-2 ring-offset-green-50 scale-105"
                            : "border-green-200 hover:scale-105"
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
              <div className="bg-white rounded-2xl shadow-lg border border-green-200">
                <div className="flex flex-wrap border-b border-green-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`py-4 px-6 font-semibold transition-all duration-200 flex items-center gap-2
                        ${
                          activeTab === tab.id
                            ? "text-green-700 bg-green-50 border-b-2 border-green-600"
                            : "text-gray-500 hover:bg-green-50 hover:text-green-600"
                        }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span>{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </div>
                <div className="pt-4">{renderTabContent()}</div>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-200">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={spa.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-light text-gray-800">{spa.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {city}, {country}
                    </p>
                    <div className="flex items-center mt-3">
                      <Star className="w-5 h-5 text-green-400 fill-current" />
                      <span className="ml-1 text-gray-500">4.8 (96 reviews)</span>
                    </div>
                  </div>

                  {/* Spa Info */}
                  <div className="space-y-3 py-3 border-b border-green-200">
                    <p className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-700">Specialty:</span>
                      <span className="text-gray-600">{spa.treatment_type || "Wellness"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-700">Ambiance:</span>
                      <span className="text-gray-600">{spa.ambiance_type || "Serene"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-700">Starting From:</span>
                      <span className="text-green-700 font-bold">{formatPrice(spa.price)}</span>
                    </p>
                  </div>

                  {/* Contact Info */}
                  {(spa.contact_phone || spa.contact_email || spa.website) && (
                    <div className="space-y-3 py-3 border-b border-green-200">
                      <h4 className="font-semibold text-gray-800">Contact Information</h4>
                      {spa.contact_phone && (
                        <p className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{spa.contact_phone}</span>
                        </p>
                      )}
                      {spa.contact_email && (
                        <p className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{spa.contact_email}</span>
                        </p>
                      )}
                      {spa.website && (
                        <p className="flex items-center space-x-2 text-sm">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                            Visit Website
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Book Now Button */}
                  <button
                    onClick={() => router.visit(`/spa-booking?id=${spa.id}`)}
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:bg-green-700 hover:shadow-lg"
                  >
                    Book Your Retreat
                  </button>

                  {/* Wellness Benefits */}
                  <div className="border-t border-green-200 pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Wellness Benefits
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-3">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 text-lg">🌿</span>
                        <span>
                          <span className="font-semibold text-gray-800">Natural Healing</span>
                          <br />
                          Organic products and traditional techniques
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 text-lg">💆</span>
                        <span>
                          <span className="font-semibold text-gray-800">Expert Therapists</span>
                          <br />
                          Certified professionals with years of experience
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 text-lg">✨</span>
                        <span>
                          <span className="font-semibold text-gray-800">Holistic Approach</span>
                          <br />
                          Treating mind, body, and spirit together
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Opening Hours */}
                  {Object.keys(openingHours).length > 0 && (
                    <div className="border-t border-green-200 pt-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Opening Hours</h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(openingHours).slice(0, 3).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{day}:</span>
                            {hours.open ? (
                              <span className="text-green-600">
                                {hours.from} - {hours.to}
                              </span>
                            ) : (
                              <span className="text-red-400">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Modal */}
        <TreatmentModal />
      </div>
    </MainLayout>
  );
};

export default SpaDetailed;
