// resources/js/Pages/Main/Gyms/GymDetailed.tsx
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
  Dumbbell,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Zap,
  Target
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

interface GymClass {
  id: number;
  name: string;
  description: string;
  schedule: string;
  duration: string;
  instructor: string;
  capacity: number;
  difficulty: string;
}

interface Gym {
  id: number;
  name: string;
  location?: string;
  description?: string;
  gym_type?: string;
  equipment_type?: string;
  category?: string;
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
  membership_options?: Array<{
    name: string;
    price: string;
    duration: string;
    features: string[];
  }>;
  classes?: GymClass[];
  capacity?: number;
  established_year?: number;
  is_24_7?: boolean;
  has_personal_training?: boolean;
  has_group_classes?: boolean;
  has_pool?: boolean;
  has_sauna?: boolean;
  has_childcare?: boolean;
}

interface Props extends PageProps {
  gym?: Gym;
}

const GymDetailed: React.FC = () => {
  const { gym } = usePage<Props>().props;
  const [activeGalleryImageIndex, setActiveGalleryImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [times, setTimes] = useState<{ walking: string; bus: string; car: string } | null>(null);

  // CORRECTED Image URL helper function
  const getImageUrl = (imagePath: string | undefined | null, fallback: string = "/storage/default-gym.jpg"): string => {
    if (!imagePath) return fallback;

    // If it's already a full URL, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // If it starts with /, use it as is (absolute path)
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // For relative paths from storage, prepend with /storage/
    // This assumes your files are in storage/app/public and you have a symlink
    return `/storage/${imagePath}`;
  };

  // Debug: Log gym data when component mounts or gym changes
  useEffect(() => {
    console.log("🏋️‍♂️ GymDetailed Component Mounted");
    console.log("📦 Full Gym Data:", gym);

    if (gym) {
      console.log("🆔 Gym ID:", gym.id);
      console.log("🏷️ Gym Name:", gym.name);
      console.log("📍 Location:", gym.location);
      console.log("💰 Price:", gym.price);

      // Image debugging with corrected URLs
      console.log("🖼️ Main Image (raw):", gym.main_image);
      console.log("🖼️ Main Image (corrected):", getImageUrl(gym.main_image));
      console.log("🖼️ Gallery Images (raw):", gym.gallery_images);
      console.log("🖼️ Gallery Images (corrected):", gym.gallery_images?.map(img => getImageUrl(img)));
      console.log("🖼️ Gallery Images Count:", gym.gallery_images?.length || 0);

      // Additional debug info
      console.log("🎯 Latitude:", gym.latitude, "Longitude:", gym.longitude);
      console.log("📚 Classes Count:", gym.classes?.length || 0);
      console.log("💪 Facilities Count:", gym.facilities?.length || 0);
    } else {
      console.warn("⚠️ No gym data received!");
    }
  }, [gym]);

  // Debug: Log when gallery images change
  useEffect(() => {
    const galleryImages = gym?.gallery_images ? gym.gallery_images.map(img => getImageUrl(img)) : [];
    console.log("🖼️ Gallery Images State Update:", {
      activeGalleryImageIndex,
      totalImages: galleryImages.length,
      currentImage: galleryImages[activeGalleryImageIndex],
      allImages: galleryImages
    });
  }, [activeGalleryImageIndex, gym?.gallery_images]);

  // Debug: Log tab changes
  useEffect(() => {
    console.log("📑 Active Tab Changed:", activeTab);
  }, [activeTab]);

  if (!gym) {
    console.warn("❌ No gym data - showing loading state");
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="p-8 bg-gray-800 rounded-lg shadow-md">
            <p className="text-xl font-semibold text-white">
              Loading gym details…
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle location split
  let country = "Not specified";
  let city = "Not specified";

  if (gym.location) {
    const parts = gym.location.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      city = parts[1] || "Not specified";
      country = parts[2] || "Not specified";
    } else if (parts.length === 2) {
      city = parts[0];
      country = parts[1];
    } else {
      city = gym.location;
    }
  }

  const lat = gym.latitude ? parseFloat(String(gym.latitude)) : 0;
  const lon = gym.longitude ? parseFloat(String(gym.longitude)) : 0;

  // CORRECTED: Use the helper function to get correct image URLs
  const galleryImages = gym.gallery_images ? gym.gallery_images.map(img => getImageUrl(img)) : [];
  const mainImage = getImageUrl(gym.main_image);
  const currentGalleryImage = galleryImages[activeGalleryImageIndex] || "/storage/default-gym.jpg";

  // Debug: Log image URLs being used
  console.log("🎯 Current Images in Use (CORRECTED):", {
    mainImage,
    currentGalleryImage,
    activeGalleryImageIndex,
    galleryImagesLength: galleryImages.length
  });

  const facilities = gym.facilities || [];
  const openingHours = gym.opening_hours || {};
  const classes = gym.classes || [];
  const membershipOptions = gym.membership_options || [];

  // Get user location + calculate distance and travel times
  useEffect(() => {
    if (navigator.geolocation && lat && lon) {
      console.log("📍 Getting user location...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;
          setUserLocation([userLat, userLon]);
          console.log("📍 User Location Found:", { userLat, userLon });

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
          console.log("📏 Distance Calculated:", d.toFixed(2) + " km");

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

          const calculatedTimes = {
            walking: formatTime(walkingTime),
            bus: formatTime(busTime),
            car: formatTime(carTime),
          };

          setTimes(calculatedTimes);
          console.log("⏰ Travel Times Calculated:", calculatedTimes);
        },
        (err) => {
          console.error("❌ Location error:", err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.warn("⚠️ Cannot get location - missing coordinates:", { lat, lon });
    }
  }, [lat, lon]);

  // Format price for display
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price);
    if (isNaN(priceNum)) {
      console.warn("⚠️ Invalid price format:", price);
      return price;
    }
    return `₵${price}`;
  };

  const tabs = [
    { name: "DESCRIPTION", id: "description" },
    { name: "FACILITIES", id: "facilities" },
    { name: "CLASSES", id: "classes" },
    { name: "MAP", id: "map" },
    { name: "DETAILS", id: "details" },
    { name: "JOIN NOW", id: "join" },
  ];

  // Image loading handlers for debugging
  const handleImageLoad = (imageType: string, imageUrl: string) => {
    console.log(`✅ ${imageType} Loaded Successfully:`, imageUrl);
  };

  const handleImageError = (imageType: string, imageUrl: string, fallbackUrl: string = "/storage/default-gym.jpg") => {
    console.error(`❌ ${imageType} Failed to Load:`, imageUrl);
    console.log(`🔄 Using fallback: ${fallbackUrl}`);
  };

  // Classes Section Component
  const ClassesSection = () => {
    console.log("⚡ Rendering Classes Section, count:", classes.length);
    return (
      <div className="p-6 space-y-6">
        <div className="border border-gray-700 rounded-lg p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-8 h-8 text-green-400" />
            <h3 className="text-3xl font-bold text-white">Fitness Classes</h3>
          </div>

          {classes.length > 0 ? (
            <div className="space-y-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-gray-700 rounded-xl p-6 shadow-lg border-l-4 border-green-500"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-xl text-white mb-2">{classItem.name}</h4>
                      <p className="text-gray-300 mb-3">{classItem.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-white">{classItem.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Duration:</span>
                          <span className="text-gray-300">{classItem.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Instructor:</span>
                          <span className="text-gray-300">{classItem.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Difficulty:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            classItem.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            classItem.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {classItem.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center lg:text-right">
                      <div className="bg-green-900 text-green-300 px-4 py-2 rounded-lg">
                        <span className="text-sm font-semibold">Capacity</span>
                        <div className="text-xl font-bold">{classItem.capacity}</div>
                        <span className="text-sm">people</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No classes scheduled yet</p>
              <p className="text-gray-500">Check back for upcoming fitness classes!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    console.log("🔄 Rendering Tab Content:", activeTab);
    switch (activeTab) {
      case "description":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">About {gym.name}</h3>
            <p className="text-gray-300 leading-relaxed text-lg">{gym.description}</p>

            {/* Gym Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {gym.established_year && (
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                  <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{gym.established_year}</div>
                  <div className="text-sm text-gray-400">Established</div>
                </div>
              )}

              {gym.capacity && (
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                  <Dumbbell className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">{gym.capacity}</div>
                  <div className="text-sm text-gray-400">Capacity</div>
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">{classes.length}</div>
                <div className="text-sm text-gray-400">Classes</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-400">{facilities.length}</div>
                <div className="text-sm text-gray-400">Facilities</div>
              </div>
            </div>
          </div>
        );
      case "facilities":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-gray-700 rounded-lg p-6 shadow-sm bg-gray-800">
              <h3 className="text-xl font-bold mb-4 text-white">Facilities & Equipment</h3>
              {facilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg shadow-sm border border-gray-600"
                    >
                      <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />
                      <span className="text-gray-200">{facility}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No facilities listed.</p>
              )}
            </div>
          </div>
        );
      case "classes":
        return <ClassesSection />;
      case "map":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold mb-4 text-white">Location Map</h3>
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-inner border border-gray-700">
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

                {/* Gym marker */}
                <Marker position={[lat, lon]}>
                  <Popup className="text-gray-800">
                    <div className="font-semibold">{gym.name}</div>
                    <div className="text-sm text-gray-600">{gym.location}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Location Info */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-2">📍 Location Details</h4>
              <p className="text-gray-300">{gym.location}</p>
              {distance && (
                <div className="mt-3 space-y-1 text-sm text-gray-400">
                  <p>Distance from your location: <span className="font-bold text-white">{distance.toFixed(2)} km</span></p>
                  {times && (
                    <>
                      <p>🚶 Walking: <span className="font-bold text-white">{times.walking}</span></p>
                      <p>🚌 Bus: <span className="font-bold text-white">{times.bus}</span></p>
                      <p>🚗 Car: <span className="font-bold text-white">{times.car}</span></p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case "details":
        return (
          <div className="p-6 space-y-6">
            <div className="border border-gray-700 rounded-lg p-6 shadow-sm bg-gray-800">
              <h3 className="text-2xl font-bold mb-6 text-white">Gym Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Basic Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Dumbbell size={24} className="text-blue-400" />
                    <div>
                      <h4 className="font-bold text-lg text-white">General Information</h4>
                      <p className="text-sm text-gray-400">Explore the gym's characteristics.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">Name:</span>
                      <span>{gym.name}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">Type:</span>
                      <span>{gym.gym_type || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">Category:</span>
                      <span>{gym.category || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">Equipment:</span>
                      <span>{gym.equipment_type || "Not specified"}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">Country:</span>
                      <span>{country}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">City:</span>
                      <span>{city}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-semibold w-24 text-white">Price:</span>
                      <span className="text-green-400 font-bold">{formatPrice(gym.price)}</span>
                    </li>
                    {gym.capacity && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24 text-white">Capacity:</span>
                        <span>{gym.capacity} people</span>
                      </li>
                    )}
                    {gym.established_year && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24 text-white">Established:</span>
                        <span>{gym.established_year}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Column 2: Contact & Travel Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone size={24} className="text-green-400" />
                    <div>
                      <h4 className="font-bold text-lg text-white">Contact & Travel</h4>
                      <p className="text-sm text-gray-400">Get in touch and plan your visit.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    {gym.contact_phone && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24 text-white">Phone:</span>
                        <span>{gym.contact_phone}</span>
                      </li>
                    )}
                    {gym.contact_email && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24 text-white">Email:</span>
                        <span>{gym.contact_email}</span>
                      </li>
                    )}
                    {gym.website && (
                      <li className="flex items-center space-x-2">
                        <span className="font-semibold w-24 text-white">Website:</span>
                        <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          Visit Website
                        </a>
                      </li>
                    )}
                    {distance && (
                      <>
                        <li className="flex items-center space-x-2">
                          <span className="font-semibold w-24 text-white">Distance:</span>
                          <span>{distance.toFixed(2)} km</span>
                        </li>
                      </>
                    )}
                  </ul>
                  {times && (
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Clock size={24} className="text-purple-400" />
                        <div>
                          <h4 className="font-bold text-lg text-white">Estimated Travel Time</h4>
                          <p className="text-sm text-gray-400">From your current location.</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-gray-300">
                        <li><span className="font-semibold text-white">🚶 Walking:</span> {times.walking}</li>
                        <li><span className="font-semibold text-white">🚌 Bus:</span> {times.bus}</li>
                        <li><span className="font-semibold text-white">🚗 Car:</span> {times.car}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            {Object.keys(openingHours).length > 0 && (
              <div className="border border-gray-700 rounded-lg p-6 shadow-sm bg-gray-800">
                <h4 className="text-xl font-bold mb-4 text-white">Opening Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="font-semibold capitalize text-white">{day}:</span>
                      {hours.open ? (
                        <span className="text-green-400">
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
        );
      case "join":
        return (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border border-gray-700 rounded-lg p-6 shadow-sm bg-gray-800">
              {/* Main Image */}
              <div className="w-full md:w-1/2 h-64 rounded-lg overflow-hidden shadow-md">
                <img
                  src={mainImage}
                  alt={gym.name}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad("Main Gym Image", mainImage)}
                  onError={() => handleImageError("Main Gym Image", mainImage, "/storage/default-gym.jpg")}
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-white">{gym.name}</h3>
                <p className="text-gray-400">
                  {city}, {country}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-400">
                    <strong className="text-white">Type:</strong> {gym.gym_type || "Not specified"}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-white">Equipment:</strong> {gym.equipment_type || "Not specified"}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-white">Price:</strong>{" "}
                    <span className="text-green-400 font-bold">{formatPrice(gym.price)}</span>
                  </p>
                </div>
               <button
  onClick={() => {
    console.log("🎯 Join Now Clicked - Gym ID:", gym.id);
    router.visit(`/gym-booking?id=${gym.id}`);
  }}
  className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
>
  JOIN NOW
</button>
              </div>
            </div>
          </div>
        );
      default:
        console.warn("❌ Unknown tab:", activeTab);
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-md border border-gray-700">
                <img
                  src={currentGalleryImage}
                  alt={`Gallery main view ${activeGalleryImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(`Gallery Image ${activeGalleryImageIndex + 1}`, currentGalleryImage)}
                  onError={() => handleImageError(`Gallery Image ${activeGalleryImageIndex + 1}`, currentGalleryImage, "/storage/default-gym.jpg")}
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
                            ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 scale-105"
                            : "border-gray-600 hover:scale-105"
                        }`}
                      onClick={() => {
                        console.log("🖼️ Thumbnail Clicked:", { index, image });
                        setActiveGalleryImageIndex(index);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad(`Thumbnail ${index + 1}`, image)}
                        onError={() => handleImageError(`Thumbnail ${index + 1}`, image)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <div className="flex flex-wrap border-b border-gray-700">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`py-4 px-6 font-semibold transition-colors duration-200
                        ${
                          activeTab === tab.id
                            ? "text-white bg-blue-600"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                      onClick={() => {
                        console.log("📑 Tab Clicked:", tab.id);
                        setActiveTab(tab.id);
                      }}
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
              <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={gym.name}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad("Sidebar Main Image", mainImage)}
                    onError={() => handleImageError("Sidebar Main Image", mainImage, "/storage/default-gym.jpg")}
                  />
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{gym.name}</h2>
                    <p className="text-gray-400 text-sm">
                      {city}, {country}
                    </p>
                    <div className="flex items-center mt-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-400">4.5 (128 reviews)</span>
                    </div>
                  </div>

                  {/* Gym Info */}
                  <div className="space-y-2 py-2 border-b border-gray-700">
                    <p className="flex items-center space-x-2">
                      <Dumbbell className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-400">Type:</span>
                      <span className="text-white">{gym.gym_type || "Not specified"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-400">Category:</span>
                      <span className="text-white">{gym.category || "Not specified"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-400">Equipment:</span>
                      <span className="text-white">{gym.equipment_type || "Not specified"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-400">Price:</span>
                      <span className="text-green-400 font-bold">{formatPrice(gym.price)}</span>
                    </p>
                  </div>

                  {/* Contact Info */}
                  {(gym.contact_phone || gym.contact_email || gym.website) && (
                    <div className="space-y-2 py-2 border-b border-gray-700">
                      <h4 className="font-semibold text-white">Contact Information</h4>
                      {gym.contact_phone && (
                        <p className="flex items-center space-x-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{gym.contact_phone}</span>
                        </p>
                      )}
                      {gym.contact_email && (
                        <p className="flex items-center space-x-2 text-sm text-gray-300">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{gym.contact_email}</span>
                        </p>
                      )}
                      {gym.website && (
                        <p className="flex items-center space-x-2 text-sm">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            Visit Website
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Join Now Button */}
                 <button
  onClick={() => {
    console.log("🎯 Sidebar Join Now Clicked - Gym ID:", gym.id);
    router.visit(`/gym-booking?id=${gym.id}`);
  }}
  className="w-full bg-blue-600 text-white font-bold py-3 rounded-md mt-4 transition-colors duration-200 hover:bg-blue-700"
>
  JOIN NOW
</button>

                  {/* Help Section */}
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-semibold text-white mb-2">
                      Need Hospitality Answer Help?
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      We would be more than happy to help you. Our Account
                      Manager are 24/7 at your service to help you.
                    </p>
                    <div className="text-blue-400 font-bold text-lg">
                      📞 +233-247-94-3218
                    </div>
                    <div className="text-gray-500 text-sm">
                      ✉️ info@hospitalityanswer.com
                    </div>
                  </div>

                  {/* Why Join With Us */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="font-semibold text-white mb-4">
                      Why Join with us?
                    </h3>
                    <ul className="text-sm text-gray-400 space-y-4">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-400 text-lg">💪</span>
                        <span>
                          <span className="font-semibold text-white">Premium Facilities</span>
                          <br />
                          State-of-the-art equipment and modern workout spaces
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-400 text-lg">👥</span>
                        <span>
                          <span className="font-semibold text-white">
                            Expert Trainers
                          </span>
                          <br />
                          Certified professionals to guide your fitness journey
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 text-lg">⚡</span>
                        <span>
                          <span className="font-semibold text-white">
                            Flexible Memberships
                          </span>
                          <br />
                          Plans that fit your schedule and budget
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

export default GymDetailed;
