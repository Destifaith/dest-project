import React, { useState, useCallback } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { usePage, router } from "@inertiajs/react";
import { Beach } from "./ManageBeaches";
import { PageProps } from "@/types";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface FormDataState {
  name: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  sand_type: string;
  water_type: string;
  facilities: string[];
  is_public: boolean;
  main_image?: File | null;
  gallery_images?: File[];
}

const EditBeach: React.FC = () => {
  const { beach } = usePage<PageProps & { beach: Beach }>().props;

  const [formData, setFormData] = useState<FormDataState>({
    name: beach.name,
    description: beach.description,
    location: beach.location,
    latitude: beach.latitude,
    longitude: beach.longitude,
    sand_type: beach.sand_type,
    water_type: beach.water_type,
    facilities: beach.facilities || [],
    is_public: beach.is_public,
    main_image: null,
    gallery_images: [],
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, main_image: e.target.files![0] }));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        gallery_images: Array.from(e.target.files!),
      }));
    }
  };

  const handleMarkerDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setFormData(prev => ({
        ...prev,
        latitude: e.latLng.lat().toString(),
        longitude: e.latLng.lng().toString(),
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "main_image" && value) {
        data.append("main_image", value as File);
      } else if (key === "gallery_images" && value) {
        (value as File[]).forEach(file => data.append("gallery_images[]", file));
      } else if (key === "is_public") {
        data.append(key, value ? "1" : "0"); // ensure boolean is sent correctly
      } else if (Array.isArray(value)) {
        data.append(key, (value as string[]).join(","));
      } else if (value !== null && value !== undefined) {
        data.append(key, value as string);
      }
    });

    // Use PUT instead of POST + _method
    router.put(`/beaches/${beach.id}`, data, {
      preserveScroll: true,
      onSuccess: () => {
        router.get(`/dashboard/entertainment/beaches/${beach.id}`); // redirect to view page
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-6 py-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Beach: {beach.name}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label className="font-semibold text-gray-900 dark:text-gray-100 mb-1 block">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label className="font-semibold text-gray-900 dark:text-gray-100 mb-1 block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
              rows={4}
            />
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label className="font-semibold text-gray-900 dark:text-gray-100 mb-1 block">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <label className="font-semibold text-gray-900 dark:text-gray-100 mb-1 block">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <label className="font-semibold text-gray-900 dark:text-gray-100 mb-1 block">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Public Checkbox */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex items-center space-x-4">
            <label className="font-semibold text-gray-900 dark:text-gray-100">Public</label>
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
            />
          </div>

          {/* Main Image */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label className="font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Main Image</label>
            <input type="file" onChange={handleMainImageChange} />
            {beach.main_image && (
              <img
                src={`${window.location.origin}/storage/${beach.main_image.image_path}`}
                alt="Main"
                className="mt-4 w-full h-60 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Gallery Images */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label className="font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Gallery Images</label>
            <input type="file" multiple onChange={handleGalleryChange} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {beach.gallery_images.map(img => (
                <img
                  key={img.id}
                  src={`${window.location.origin}/storage/${img.image_path}`}
                  alt={`Gallery ${img.id}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Google Map */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Location Map</h2>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "300px" }}
                center={{
                  lat: parseFloat(formData.latitude),
                  lng: parseFloat(formData.longitude),
                }}
                zoom={14}
              >
                <Marker
                  position={{
                    lat: parseFloat(formData.latitude),
                    lng: parseFloat(formData.longitude),
                  }}
                  draggable
                  onDragEnd={handleMarkerDrag}
                />
              </GoogleMap>
            ) : (
              <p className="text-gray-500 dark:text-gray-300">Loading map...</p>
            )}
          </div>

          {/* Submit / Cancel */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-gray-600 rounded-lg hover:bg-primary/90 transition"
            >
              Update Beach
            </button>
            <a
              href={`/dashboard/entertainment/beaches/${beach.id}`}
              className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditBeach;
