import React from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { usePage } from "@inertiajs/react";
import { Beach } from "./ManageBeaches";
import { PageProps } from "@/types";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const ViewBeach: React.FC = () => {
//   const { beach } = usePage<{ beach: Beach }>().props;
const { beach } = usePage<PageProps<{ beach: Beach }>>().props;
  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-6 py-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {beach.name}
        </h1>

        {/* Main Image */}
        {beach.main_image && (
          <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <img
              src={`${window.location.origin}/storage/${beach.main_image.image_path}`}
              alt={beach.name}
              className="w-full h-[70vh] object-cover"
            />
          </div>
        )}

        {/* Beach Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">{beach.description}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Location</h2>
              <p className="text-gray-700 dark:text-gray-300">{beach.location}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Sand Type</h2>
              <p className="text-gray-700 dark:text-gray-300">{beach.sand_type}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Water Type</h2>
              <p className="text-gray-700 dark:text-gray-300">{beach.water_type}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Facilities</h2>
              <p className="text-gray-700 dark:text-gray-300">{beach.facilities.join(", ")}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Public Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  beach.is_public ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {beach.is_public ? "Public" : "Not Public"}
              </span>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Created At</h2>
              <p className="text-gray-700 dark:text-gray-300">{beach.created_at}</p>
            </div>
          </div>

          {/* Gallery Images */}
          {beach.gallery_images.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gallery Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {beach.gallery_images.map((img) => (
                  <div key={img.id} className="rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={`${window.location.origin}/storage/${img.image_path}`}
                      alt={`Gallery ${img.id}`}
                      className="w-full h-60 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Location Map</h2>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              center={{ lat: parseFloat(beach.latitude), lng: parseFloat(beach.longitude) }}
              zoom={14}
            >
              <Marker
                position={{ lat: parseFloat(beach.latitude), lng: parseFloat(beach.longitude) }}
              />
            </GoogleMap>
          ) : (
            <p className="text-gray-500 dark:text-gray-300">Loading map...</p>
          )}
        </div>

        {/* Back Button */}
       <div className="flex space-x-4 mt-6">
  <a
    href="/dashboard/entertainment/beaches/manage"
    className="inline-block px-6 py-3 bg-primary text-gray-500 rounded-lg font-medium hover:bg-primary/90 transition"
  >
    Back to Manage Beaches
  </a>
  <a
    href={`/dashboard/entertainment/beaches/${beach.id}/edit`}
    className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
  >
    Edit Beach
  </a>
</div>

      </div>
    </DashboardLayout>
  );
};

export default ViewBeach;
