// resources/js/Pages/Main/Beach/BeachDetailed.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CheckCircle } from "lucide-react";
import { Utensils, Droplet, Sun, Clock } from "lucide-react"; // New icons imported
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

interface Beach {
  id: number;
  name: string;
  location?: string;
  description?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  main_image?: { image_path?: string } | null;
  gallery_images?: { id: number; image_path: string }[];
  sand_type?: string;
  water_type?: string;
  facilities?: string[];
  price?: number;
}

interface Props extends PageProps {
  beach?: Beach;
}

const BeachDetailed: React.FC = () => {
  const { beach } = usePage<Props>().props;
  const [activeGalleryImageIndex, setActiveGalleryImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  // User location + distance + times
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [times, setTimes] = useState<{ walking: string; bus: string; car: string } | null>(null);

  if (!beach) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <p className="text-xl font-semibold text-gray-800">
              Loading beach details…
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle location split
  let country = "Not specified";
  let city = "Not specified";

  if (beach.location) {
    const parts = beach.location.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      city = parts[1] || "Not specified";
      country = parts[2] || "Not specified";
    } else if (parts.length === 2) {
      city = parts[0];
      country = parts[1];
    } else {
      city = beach.location;
    }
  }

  const lat = beach.latitude ? parseFloat(String(beach.latitude)) : 0;
  const lon = beach.longitude ? parseFloat(String(beach.longitude)) : 0;

  const galleryImages = beach.gallery_images || [];
  const mainImage = beach.main_image?.image_path
    ? `/storage/${beach.main_image.image_path}`
    : "/path/to/placeholder/main-image.jpg";
  const currentGalleryImage = galleryImages[activeGalleryImageIndex]?.image_path
    ? `/storage/${galleryImages[activeGalleryImageIndex].image_path}`
    : "/path/to/placeholder/gallery-image.jpg";

  const facilities = beach.facilities || [];
  const price = beach.price ?? 50;

  // Get user location + calculate distance and travel times
  useEffect(() => {
    if (navigator.geolocation) {
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

  const tabs = [
    { name: "DESCRIPTION", id: "description" },
    { name: "MAP", id: "map" },
    { name: "DETAILS", id: "details" },
    { name: "FACILITIES", id: "facilities" },
    { name: "REVIEWS", id: "reviews" },
    { name: "BOOK NOW", id: "book" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Overview</h3>
            <p className="text-gray-700 leading-relaxed">{beach.description}</p>
          </div>
        );
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

                {/* Beach marker */}
                <Marker position={[lat, lon]}>
                  <Popup>{beach.name}</Popup>
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
                  Distance to beach:{" "}
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
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Beach Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Basic Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Sun size={24} className="text-yellow-500" />
                    <div>
                      <h4 className="font-bold text-lg">General Information</h4>
                      <p className="text-sm">Explore the fundamental characteristics.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Title:</span>
                      <span>{beach.name}</span>
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
                      <span className="font-semibold w-24">Price:</span>
                      <span>${price}</span>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Environmental Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Droplet size={24} className="text-blue-500" />
                    <div>
                      <h4 className="font-bold text-lg">Natural Features</h4>
                      <p className="text-sm">Discover the unique sand and water types.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Sand Colour:</span>
                      <span>{beach.sand_type || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24">Water Colour:</span>
                      <span>{beach.water_type || "Not specified"}</span>
                    </li>
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
          </div>
        );
      case "facilities":
        return (
          <div className="p-6 space-y-6">
            <div className="border rounded-lg p-6 shadow-sm bg-gray-50">
              <h3 className="text-xl font-bold mb-4">Facilities</h3>
              {facilities.length > 0 ? (
                <ul className="space-y-3">
                  {facilities.map((facility, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-gray-700"
                    >
                      <CheckCircle className="text-green-500 w-5 h-5" />
                      <span>{facility}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No facilities listed.</p>
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
      case "book":
        return (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border rounded-lg p-6 shadow-sm bg-gray-50">
              {/* Main Image */}
              <div className="w-full md:w-1/2 h-64 rounded-lg overflow-hidden shadow-md">
                <img
                  src={mainImage}
                  alt={beach.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold">{beach.name}</h3>
                <p className="text-gray-500">
                  {city}, {country}
                </p>
                <div className="space-y-2">
  <p className="text-gray-500 dark:text-gray-500">
    <strong>Adult Price:</strong>{" "}
    <span className="text-green-600 dark:text-green-400 font-bold">${price}</span>
  </p>
  <p className="text-gray-500 dark:text-gray-500">
    <strong>Children Price:</strong>{" "}
    <span className="text-green-600 dark:text-green-400 font-bold">
      ${(price * 0.7).toFixed(2)}
    </span>
  </p>
</div>
           <button
  onClick={() => router.visit(`/beach-booking?id=${beach.id}`)}
  className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
>
  Book Now
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
                      key={image.id || `thumb-${index}`}
                      className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out
                        ${
                          index === activeGalleryImageIndex
                            ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                            : "hover:scale-105"
                        }`}
                      onClick={() => setActiveGalleryImageIndex(index)}
                    >
                      <img
                        src={`/storage/${image.image_path}`}
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
                    alt={beach.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{beach.name}</h2>
                    <p className="text-gray-500 text-sm">
                      {city}, {country}
                    </p>
                  </div>

                  {/* Sand & Water Info */}
                  <div className="space-y-2 py-2 border-b border-gray-200">
                    <p>
                      <span className="font-semibold text-gray-600">
                        Sand Colour:{" "}
                      </span>
                      {beach.sand_type || "Not specified"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Water Colour:{" "}
                      </span>
                      {beach.water_type || "Not specified"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Price:{" "}
                      </span>
                      ${price}
                    </p>
                  </div>

                  {/* Add to Cart */}
                  <button onClick={() => router.visit(`/beach-booking?id=${beach.id}`)} className="w-full bg-yellow-500 text-white font-bold py-3 rounded-md mt-4 transition-colors duration-200 hover:bg-yellow-600">

                    ADD TO CART
                  </button>


                  {/* Help Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Need Travelafric Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      We would be more than happy to help you. Our Account
                      Manager are 24/7 at your service to help you.
                    </p>
                    <div className="text-blue-500 font-bold text-lg">
                      📞 +233-247-94-3218
                    </div>
                    <div className="text-gray-600 text-sm">
                      ✉️ info@travelafric.com
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

export default BeachDetailed;
