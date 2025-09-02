import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { GoogleMap, Marker, Autocomplete, LoadScript } from "@react-google-maps/api";
import { router } from "@inertiajs/react";

const libraries: ("places")[] = ["places"];
const mapContainerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

const lightMapStyle: google.maps.MapTypeStyle[] = []; // Default style
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] }
];

const Beaches = () => {
  const [formData, setFormData] = useState({
    location: "",
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    sand_type: "",
    water_type: "",
    facilities: "",
    main_image: null as File | null,
    gallery_images: [] as File[],
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, main_image: e.target.files?.[0] ?? null }));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, gallery_images: e.target.files ? Array.from(e.target.files) : [] }));
  };

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData(prev => ({
      ...prev,
      location: place.formatted_address || "",
      name: place.name || "",
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    setMapCenter({ lat, lng });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    const facilitiesArray = formData.facilities
      .split(",")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    data.append("location", formData.location);
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("sand_type", formData.sand_type);
    data.append("water_type", formData.water_type);

    facilitiesArray.forEach((facility, index) => {
      data.append(`facilities[${index}]`, facility);
    });

    if (formData.main_image) data.append("main_image", formData.main_image);
    formData.gallery_images.forEach((file, index) => {
      data.append(`gallery_images[${index}]`, file);
    });

    router.post(route("beaches.store"), data, {
      onSuccess: () => {
        setFormData({
          location: "",
          name: "",
          description: "",
          latitude: "",
          longitude: "",
          sand_type: "",
          water_type: "",
          facilities: "",
          main_image: null,
          gallery_images: [],
        });
        setMapCenter(defaultCenter);
      },
      onError: (errors: any) => console.error("Validation errors:", errors),
    });
  };

  return (
    <DashboardLayout>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Beach</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Fill in the details below to add a new beach.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Location */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Location *</label>
              <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Type location..."
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </Autocomplete>
            </div>

            {/* Beach Name */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Beach Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["latitude", "longitude"].map((field) => (
                <div key={field}>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">
                    {field.charAt(0).toUpperCase() + field.slice(1)} *
                  </label>
                  <input
                    type="number"
                    name={field}
                    required
                    value={formData[field as "latitude" | "longitude"]}
                    onChange={handleChange}
                    step="any"
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Map Preview */}
            <div className="mt-4 h-64 w-full rounded-md overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={13}
                options={{
                  styles: isDarkMode ? darkMapStyle : lightMapStyle,
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={{
                      lat: parseFloat(formData.latitude),
                      lng: parseFloat(formData.longitude),
                    }}
                    icon={{
                      url: isDarkMode
                        ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    }}
                  />
                )}
              </GoogleMap>
            </div>

            {/* Sand & Water Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["sand_type", "water_type"].map((field) => (
                <div key={field}>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">
                    {field.replace("_", " ").toUpperCase()} *
                  </label>
                  <input
                    type="text"
                    name={field}
                    required
                    value={formData[field as "sand_type" | "water_type"]}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Facilities */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Facilities (comma separated) *</label>
              <input
                type="text"
                name="facilities"
                required
                value={formData.facilities}
                onChange={handleChange}
                placeholder="e.g. Restrooms, Parking, Lifeguard"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>

            {/* Main Image */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Main Image *</label>
              <input
                type="file"
                name="main_image"
                accept="image/*"
                required
                onChange={handleMainImageChange}
                className="mt-1 block w-full text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Gallery Images</label>
              <input
                type="file"
                name="gallery_images"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="mt-1 block w-full text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      </LoadScript>
    </DashboardLayout>
  );
};

export default Beaches;
