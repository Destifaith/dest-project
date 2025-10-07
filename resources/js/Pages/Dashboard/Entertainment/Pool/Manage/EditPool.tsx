import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { router, Link } from "@inertiajs/react";
import { GoogleMap, Marker, Autocomplete, LoadScript } from "@react-google-maps/api";
import { SwimmingPool } from "../../../../../types";

const libraries: ("places")[] = ["places"];
const mapContainerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

const lightMapStyle: google.maps.MapTypeStyle[] = [];
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "water", stylers: [{ color: "#0f172a" }] },
];

const poolTypes = ["Olympic", "Infinity", "Childrens", "Lap Pool", "Hotel Pool", "Public Pool"];
const waterTypes = ["Chlorinated", "Saltwater", "Freshwater", "Mineral Water"];
const facilitiesList = ["Changing rooms", "Sun loungers", "Pool bar", "Lifeguard on duty", "Snack bar", "Hot tub", "Heated pool", "Restrooms"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MAX_FILE_SIZE_KB = 2048; // 2MB in kilobytes

interface Props {
  pool: SwimmingPool;
}

const EditPool: React.FC<Props> = ({ pool }) => {
  const [formData, setFormData] = useState({
    name: pool.name,
    description: pool.description,
    location: pool.location,
    latitude: pool.latitude.toString(),
    longitude: pool.longitude.toString(),
    pool_type: pool.pool_type,
    water_type: pool.water_type,
    facilities: pool.facilities ? pool.facilities.split(',') : [] as string[],
    price: pool.price,
    status: pool.status || 'active',
    main_image: null as File | null,
    gallery_images: [] as File[],
    opening_hours: pool.opening_hours as Record<string, { open: boolean; from: string; to: string }>,
  });

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(pool.main_image ? `/storage/${pool.main_image}` : null);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(pool.gallery_images || []);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]); // Empty array for new images
  const [mapCenter, setMapCenter] = useState({
    lat: parseFloat(pool.latitude.toString()),
    lng: parseFloat(pool.longitude.toString())
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] | undefined }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Initialize opening hours if not present
  useEffect(() => {
    if (!formData.opening_hours || Object.keys(formData.opening_hours).length === 0) {
      const initialHours: Record<string, { open: boolean; from: string; to: string }> = {};
      daysOfWeek.forEach(day => {
        initialHours[day] = { open: false, from: "09:00", to: "17:00" };
      });
      setFormData(prev => ({ ...prev, opening_hours: initialHours }));
    }
  }, []);

  // Detect dark mode
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Clean up preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      galleryImagePreviews.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mainImagePreview, galleryImagePreviews]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMessage(null);
  };

  const handleFacilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newFacilities = checked
        ? [...prev.facilities, value]
        : prev.facilities.filter((f) => f !== value);
      return { ...prev, facilities: newFacilities };
    });
    setErrors((prev) => ({ ...prev, facilities: undefined }));
    setSuccessMessage(null);
  };

  const handleOpeningHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > MAX_FILE_SIZE_KB * 1024) {
        setErrors((prev) => ({ ...prev, main_image: `File size must be less than ${MAX_FILE_SIZE_KB / 1024}MB.` }));
        setFormData((prev) => ({ ...prev, main_image: null }));
        setMainImagePreview(null);
      } else {
        setFormData((prev) => ({ ...prev, main_image: file }));
        setErrors((prev) => ({ ...prev, main_image: undefined }));
        // Revoke previous URL if exists
        if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(mainImagePreview);
        }
        // Set new preview URL
        setMainImagePreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, main_image: null }));
      setMainImagePreview(pool.main_image ? `/storage/${pool.main_image}` : null);
    }
    setSuccessMessage(null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE_KB * 1024);

    if (oversizedFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        gallery_images: `One or more gallery images exceed the ${MAX_FILE_SIZE_KB / 1024}MB size limit.`,
      }));
    } else {
      // Add new files to existing ones
      setFormData((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...files]
      }));
      setErrors((prev) => ({ ...prev, gallery_images: undefined }));

      // Create previews for new files
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
    }

    // Reset the input to allow selecting the same files again
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
    setSuccessMessage(null);
  };

  const removeGalleryImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Mark existing image for deletion
      setExistingGalleryImages(prev => {
        const newImages = [...prev];
        newImages.splice(index, 1);
        return newImages;
      });
    } else {
      // Remove the image from form data
      setFormData(prev => {
        const newGalleryImages = [...prev.gallery_images];
        newGalleryImages.splice(index, 1);
        return { ...prev, gallery_images: newGalleryImages };
      });

      // Remove the preview and revoke the URL
      setGalleryImagePreviews(prev => {
        const newPreviews = [...prev];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    }
  };

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      location: place.formatted_address || "",
      name: place.name || prev.name,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    setMapCenter({ lat, lng });
    setErrors((prev) => ({ ...prev, location: undefined }));
    setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const data = new FormData();
    data.append("_method", "PUT");
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("pool_type", formData.pool_type);
    data.append("water_type", formData.water_type);
    data.append("facilities", formData.facilities.join(","));
    data.append("price", formData.price);
    data.append("status", formData.status);
    data.append("opening_hours", JSON.stringify(formData.opening_hours));
    data.append("existing_gallery_images", JSON.stringify(existingGalleryImages));

    if (formData.main_image) data.append("main_image", formData.main_image);
    formData.gallery_images.forEach((file) => {
      data.append(`gallery_images[]`, file);
    });

    router.post(`/swimming-pools/${pool.id}`, data, {
      onSuccess: () => {
        setErrors({});
        setSuccessMessage("Swimming pool updated successfully!");
      },
      onError: (serverErrors: any) => {
        setErrors(serverErrors);
        setSuccessMessage(null);
      },
    });
  };

  return (
    <DashboardLayout>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Swimming Pool</h1>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Update the details of this swimming pool.</p>
            </div>
            <Link
              href="/dashboard/entertainment/pool/manage"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Back to Manage
            </Link>
          </div>

          {successMessage && (
            <div className="mt-4 p-4 rounded-md bg-green-500 text-white font-medium">
              {successMessage}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Status Toggle */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block font-medium text-gray-700 dark:text-gray-200 mb-2">Status</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                  className={`px-4 py-2 rounded-l-md ${
                    formData.status === 'active'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                  className={`px-4 py-2 rounded-r-md ${
                    formData.status === 'inactive'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

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
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Pool Name */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Pool Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Price *</label>
              <input
                type="text"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. $20 per day or Free entry"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
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
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
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
                        ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    }}
                  />
                )}
              </GoogleMap>
            </div>

            {/* Pool & Water Types as dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Pool Type *</label>
                <select
                  name="pool_type"
                  required
                  value={formData.pool_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="" disabled>Select a pool type</option>
                  {poolTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.pool_type && <p className="text-red-500 text-sm mt-1">{errors.pool_type}</p>}
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Water Type *</label>
                <select
                  name="water_type"
                  required
                  value={formData.water_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="" disabled>Select a water type</option>
                  {waterTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.water_type && <p className="text-red-500 text-sm mt-1">{errors.water_type}</p>}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <label className="block font-medium text-gray-700 dark:text-gray-200 mb-3">Opening Hours</label>
              <div className="space-y-3">
                {daysOfWeek.map(day => (
                  <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <input
                        type="checkbox"
                        id={`open-${day}`}
                        checked={formData.opening_hours[day]?.open || false}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor={`open-${day}`} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {day}
                      </label>
                    </div>

                    {formData.opening_hours[day]?.open && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <label htmlFor={`from-${day}`} className="sr-only">From</label>
                          <input
                            type="time"
                            id={`from-${day}`}
                            value={formData.opening_hours[day]?.from || "09:00"}
                            onChange={(e) => handleOpeningHoursChange(day, 'from', e.target.value)}
                            className="block w-28 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                          />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">to</span>
                        <div className="flex items-center">
                          <label htmlFor={`to-${day}`} className="sr-only">To</label>
                          <input
                            type="time"
                            id={`to-${day}`}
                            value={formData.opening_hours[day]?.to || "17:00"}
                            onChange={(e) => handleOpeningHoursChange(day, 'to', e.target.value)}
                            className="block w-28 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities as checkboxes */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Facilities *</label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {facilitiesList.map((facility) => (
                  <div key={facility} className="flex items-center">
                    <input
                      type="checkbox"
                      id={facility}
                      name="facilities"
                      value={facility}
                      checked={formData.facilities.includes(facility)}
                      onChange={handleFacilityChange}
                      className="rounded text-primary focus:ring-primary dark:bg-gray-800 dark:ring-offset-gray-900"
                    />
                    <label htmlFor={facility} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {facility}
                    </label>
                  </div>
                ))}
              </div>
              {errors.facilities && <p className="text-red-500 text-sm mt-1">{errors.facilities}</p>}
            </div>

            {/* Main Image */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Main Image (Max 2MB)</label>
              <input
                type="file"
                name="main_image"
                accept="image/*"
                onChange={handleMainImageChange}
                className="mt-1 block w-full text-gray-900 dark:text-gray-100"
              />
              {mainImagePreview && (
                <div className="mt-2">
                  <img
                    src={mainImagePreview}
                    alt="Main image preview"
                    className="h-40 w-auto rounded-md object-cover"
                  />
                </div>
              )}
              {errors.main_image && <p className="text-red-500 text-sm mt-1">{errors.main_image}</p>}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Gallery Images (Max 2MB each)</label>
              <input
                ref={galleryInputRef}
                type="file"
                name="gallery_images"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="mt-1 block w-full text-gray-900 dark:text-gray-100"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You can add multiple images at once or add more later
              </p>

              {/* Only show if there are any images */}
              {(existingGalleryImages.length > 0 || galleryImagePreviews.length > 0) && (
                <div className="mt-3">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Images ({existingGalleryImages.length + galleryImagePreviews.length})
                  </h3>

                  {/* Existing Images from Database */}
                  {existingGalleryImages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Existing Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {existingGalleryImages.map((imagePath, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <img
                              src={`/storage/${imagePath}`}
                              alt={`Existing gallery image ${index + 1}`}
                              className="h-24 w-full rounded-md object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index, true)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly Added Images (Previews) */}
                  {galleryImagePreviews.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {galleryImagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={preview}
                              alt={`New gallery image ${index + 1}`}
                              className="h-24 w-full rounded-md object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index, false)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                              {formData.gallery_images[index]?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {errors.gallery_images && <p className="text-red-500 text-sm mt-1">{errors.gallery_images}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Update Pool
              </button>
              <Link
                href="/dashboard/entertainment/pool/manage"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </LoadScript>
    </DashboardLayout>
  );
};

export default EditPool;
