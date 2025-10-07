import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { router, Link } from "@inertiajs/react";
import { GoogleMap, Marker, Autocomplete, LoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];
const mapContainerStyle = { width: "100%", height: "400px" };

interface Award {
  id: string;
  title: string;
  description: string;
  year: string;
  image: File | null;
  existing_image?: string;
}

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface Restaurant {
  id: number;
  name: string;
  location: string;
  description: string;
  cuisine_type: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHours;
  special_closure_days: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  capacity: number;
  features: string[];
  reservation_policy: string;
  has_daily_menu: boolean;
  daily_menu_email: string;
  main_image: string | File | null;
  gallery_images: (string | File)[];
  menu_pdf: string | File | null;
  owner_full_name: string;
  owner_bio: string;
  owner_experience_years: number;
  owner_specialties: string;
  owner_education: string;
  owner_image: string | File | null;
  awards: Award[];
  is_active: boolean;
}

interface Props {
  restaurant: Restaurant;
}

interface FormErrors {
  [key: string]: string;
}

const EditRestaurant: React.FC<Props> = ({ restaurant: initialRestaurant }) => {
  const [formData, setFormData] = useState<Restaurant>({
    ...initialRestaurant,
    // Ensure coordinates are numbers
    latitude: Number(initialRestaurant.latitude) || 0,
    longitude: Number(initialRestaurant.longitude) || 0,
    // Ensure gallery_images is always an array
    gallery_images: initialRestaurant.gallery_images || [],
    // Ensure awards is always an array
    awards: initialRestaurant.awards || [],
    // Ensure features is always an array
    features: initialRestaurant.features || [],
    // Ensure opening_hours has proper structure
    opening_hours: initialRestaurant.opening_hours || {}
  });

  const [mapCenter, setMapCenter] = useState({
    lat: Number(initialRestaurant.latitude) || 0,
    lng: Number(initialRestaurant.longitude) || 0
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);

  // Options for dropdowns and checkboxes
  const cuisineOptions = [
    "African", "American", "Asian", "BBQ", "Bakery", "Brazilian", "Breakfast",
    "British", "Burger", "Cafe", "Chinese", "Coffee", "Desserts", "French",
    "German", "Greek", "Indian", "Indonesian", "Italian", "Japanese", "Korean",
    "Lebanese", "Mediterranean", "Mexican", "Middle Eastern", "Pizza", "Seafood",
    "Spanish", "Steakhouse", "Sushi", "Thai", "Turkish", "Vegan", "Vegetarian",
    "Vietnamese", "Other"
  ];

  const featureOptions = [
    "Outdoor Seating", "WiFi", "Parking", "Takeout", "Delivery",
    "Reservations", "Wheelchair Accessible", "Alcohol Served",
    "Live Music", "Kid Friendly", "Pet Friendly"
  ];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Enhanced image URL helper - FIXED VERSION
  const getImageUrl = (path: string | null | File, type: string = 'image') => {
    if (!path) {
      console.log(`[DEBUG] ${type} path is null or empty`);
      return '';
    }

    if (typeof path !== 'string') {
      console.log(`[DEBUG] ${type} is not a string:`, path);
      return '';
    }

    // Use the path exactly as stored in database (it already includes folder structure)
    const fullUrl = `/storage/${path}`;
    console.log(`[DEBUG] ${type} final URL:`, fullUrl);
    console.log(`[DEBUG] ${type} original path from DB:`, path);

    return fullUrl;
  };

  // Test image loading
  const testImageLoad = (url: string, imageType: string) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ ${imageType} loaded successfully:`, url);
    };
    img.onerror = () => {
      console.log(`❌ ${imageType} failed to load:`, url);
      console.log(`❌ Full URL attempted: ${window.location.origin}${url}`);
    };
    img.src = url;
  };

  // Test all images on component mount
  useEffect(() => {
    console.log("=== IMAGE LOADING TESTS ===");

    if (formData.main_image && typeof formData.main_image === 'string') {
      const mainImageUrl = getImageUrl(formData.main_image, 'Main Image');
      console.log(`Testing main image: ${mainImageUrl}`);
      testImageLoad(mainImageUrl, 'Main Image');
    }

    if (formData.owner_image && typeof formData.owner_image === 'string') {
      const ownerImageUrl = getImageUrl(formData.owner_image, 'Owner Image');
      console.log(`Testing owner image: ${ownerImageUrl}`);
      testImageLoad(ownerImageUrl, 'Owner Image');
    }

    if (formData.gallery_images) {
      formData.gallery_images.forEach((img, index) => {
        if (typeof img === 'string') {
          const galleryImageUrl = getImageUrl(img, `Gallery Image ${index + 1}`);
          console.log(`Testing gallery image ${index + 1}: ${galleryImageUrl}`);
          testImageLoad(galleryImageUrl, `Gallery Image ${index + 1}`);
        }
      });
    }

    // Test awards images
    if (formData.awards) {
      formData.awards.forEach((award, index) => {
        if (award.existing_image) {
          const awardImageUrl = getImageUrl(award.existing_image, `Award Image ${index + 1}`);
          console.log(`Testing award image ${index + 1}: ${awardImageUrl}`);
          testImageLoad(awardImageUrl, `Award Image ${index + 1}`);
        }
      });
    }
  }, [formData.main_image, formData.owner_image, formData.gallery_images, formData.awards]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "capacity" || name === "owner_experience_years") {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    } else if (name === "latitude" || name === "longitude") {
      // Ensure coordinates are numbers
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : 0 }));
      // Update map center when coordinates change
      if (name === "latitude") {
        setMapCenter(prev => ({ ...prev, lat: parseFloat(value) || 0 }));
      } else if (name === "longitude") {
        setMapCenter(prev => ({ ...prev, lng: parseFloat(value) || 0 }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle opening hours changes
  const handleOpeningHoursChange = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...(prev.opening_hours[day] || { isOpen: false, openTime: "", closeTime: "" }),
          [field]: value
        }
      }
    }));
  };

  // Handle features toggle
  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = formData.features || [];
    let newFeatures;

    if (currentFeatures.includes(feature)) {
      newFeatures = currentFeatures.filter(f => f !== feature);
    } else {
      newFeatures = [...currentFeatures, feature];
    }

    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  // Handle file uploads
  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log(`[DEBUG] File selected for ${field}:`, file);
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Handle gallery images
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    console.log(`[DEBUG] Gallery files selected:`, files);
    // Keep existing gallery images and add new ones
    setFormData(prev => ({
      ...prev,
      gallery_images: [...(prev.gallery_images || []), ...files]
    }));
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    console.log(`[DEBUG] Removing gallery image at index:`, index);
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  // Award management functions
  const addAward = () => {
    const newAward: Award = {
      id: Date.now().toString(),
      title: "",
      description: "",
      year: new Date().getFullYear().toString(),
      image: null
    };
    console.log(`[DEBUG] Adding new award:`, newAward);
    setFormData(prev => ({
      ...prev,
      awards: [...(prev.awards || []), newAward]
    }));
  };

  const removeAward = (id: string) => {
    console.log(`[DEBUG] Removing award with id:`, id);
    setFormData(prev => ({
      ...prev,
      awards: prev.awards?.filter(award => award.id !== id) || []
    }));
  };

  const updateAward = (id: string, field: keyof Award, value: string | File | null) => {
    console.log(`[DEBUG] Updating award ${id} field ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      awards: prev.awards?.map(award =>
        award.id === id ? { ...award, [field]: value } : award
      ) || []
    }));
  };

  // Google Maps functions
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
      location: place.formatted_address || prev.location,
      name: place.name || prev.name,
      latitude: lat,
      longitude: lng,
    }));

    setMapCenter({ lat, lng });
  };

  // Safe marker position
  const getMarkerPosition = () => {
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return { lat: 0, lng: 0 };
    }

    return { lat, lng };
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.cuisine_type) newErrors.cuisine_type = "Cuisine type is required";
    if (!formData.contact_phone.trim()) newErrors.contact_phone = "Contact phone is required";
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Email is invalid";
    }
    if (formData.has_daily_menu && !formData.daily_menu_email) {
      newErrors.daily_menu_email = "Daily menu email is required when daily menu updates are enabled";
    }
    if (formData.has_daily_menu && formData.daily_menu_email && !/\S+@\S+\.\S+/.test(formData.daily_menu_email)) {
      newErrors.daily_menu_email = "Daily menu email is invalid";
    }
    if (!formData.owner_full_name.trim()) newErrors.owner_full_name = "Owner full name is required";
    if (!formData.owner_bio.trim()) newErrors.owner_bio = "Owner bio is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    // Append all basic fields
    Object.keys(formData).forEach(key => {
      if (!["main_image", "gallery_images", "menu_pdf", "owner_image", "opening_hours", "awards", "features", "id"].includes(key)) {
        const value = formData[key as keyof Restaurant];
        if (value !== null && value !== undefined) {
          if (typeof value === "boolean") {
            data.append(key, value ? "1" : "0");
          } else {
            data.append(key, value.toString());
          }
        }
      }
    });

    // Append complex fields
    data.append("opening_hours", JSON.stringify(formData.opening_hours));
    data.append("features", JSON.stringify(formData.features || []));
    data.append("_method", "PUT");

    // Append files if they are new (File objects)
    if (formData.main_image instanceof File) {
      data.append("main_image", formData.main_image);
    }

    if (formData.menu_pdf instanceof File) {
      data.append("menu_pdf", formData.menu_pdf);
    }

    if (formData.owner_image instanceof File) {
      data.append("owner_image", formData.owner_image);
    }

    // Append gallery images (only new File objects)
    formData.gallery_images.forEach((file, index) => {
      if (file instanceof File) {
        data.append(`gallery_images[${index}]`, file);
      }
    });

    // Append awards
    if (formData.awards) {
      formData.awards.forEach((award, index) => {
        data.append(`awards[${index}][title]`, award.title);
        data.append(`awards[${index}][description]`, award.description || "");
        data.append(`awards[${index}][year]`, award.year);
        if (award.id && award.id.startsWith("existing-")) {
          data.append(`awards[${index}][id]`, award.id.replace("existing-", ""));
        }
        if (award.image instanceof File) {
          data.append(`award_images[${index}]`, award.image);
        }
      });
    }

    console.log("[DEBUG] Form data being submitted:", {
      main_image: formData.main_image,
      owner_image: formData.owner_image,
      gallery_images: formData.gallery_images,
      awards: formData.awards
    });

    router.post(route("restaurants.update", formData.id), data, {
      onSuccess: () => {
        setSuccessMessage("Restaurant updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (errors: any) => {
        console.error("[DEBUG] Form submission errors:", errors);
        if (errors && typeof errors === 'object') {
          const flattenedErrors: FormErrors = {};
          Object.keys(errors).forEach(field => {
            if (field !== 'message' && field !== 'success') {
              flattenedErrors[field] = errors[field];
            }
          });
          setErrors(flattenedErrors);
        }
      },
    });
  };

  // Remove existing image
  const removeExistingImage = (field: string) => {
    console.log(`[DEBUG] Removing existing image for field:`, field);
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  // Check if value is a string (existing file path)
  const isString = (value: any): value is string => {
    return typeof value === 'string';
  };

  // Check if value is a File object
  const isFile = (value: any): value is File => {
    return value instanceof File;
  };

  return (
    <DashboardLayout>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="px-4 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Restaurant</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Update your restaurant information
                </p>
              </div>
              <Link
                href={route("restaurants.manage")}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/50 font-medium"
              >
                Back to Manage
              </Link>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{successMessage}</span>
                </div>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="text-green-700 hover:text-green-900 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Debug Info Panel */}
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            <h3 className="font-bold mb-2">🔍 Debug Information</h3>
            <div className="text-sm">
              <p><strong>Main Image:</strong> {formData.main_image ? (typeof formData.main_image === 'string' ? formData.main_image : 'File object') : 'None'}</p>
              <p><strong>Owner Image:</strong> {formData.owner_image ? (typeof formData.owner_image === 'string' ? formData.owner_image : 'File object') : 'None'}</p>
              <p><strong>Gallery Images:</strong> {formData.gallery_images?.length || 0} items</p>
              <p><strong>Check browser console for detailed image loading logs</strong></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Status Toggle */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Restaurant Status</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.is_active ? 'Restaurant is currently active' : 'Restaurant is currently inactive'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      formData.is_active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>

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
                      className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                        errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                  </Autocomplete>
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                {/* Restaurant Name */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Restaurant Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                      errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                      errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Cuisine Type */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Cuisine Type *</label>
                  <select
                    name="cuisine_type"
                    required
                    value={formData.cuisine_type}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                      errors.cuisine_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Cuisine Type</option>
                    {cuisineOptions.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  {errors.cuisine_type && <p className="mt-1 text-sm text-red-600">{errors.cuisine_type}</p>}
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-200">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="any"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-200">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="any"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Map Preview */}
                <div className="mt-4 h-64 w-full rounded-md overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    options={{
                      styles: isDarkMode ? [
                        { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
                      ] : [],
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    <Marker
                      position={getMarkerPosition()}
                      icon={{
                        url: isDarkMode
                          ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      }}
                    />
                  </GoogleMap>
                </div>
              </div>

              {/* Operations & Contact Section */}
              <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Operations & Contact</h2>

                {/* Opening Hours */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200 mb-4">Opening Hours</label>
                  <div className="space-y-3">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.opening_hours[day]?.isOpen || false}
                            onChange={(e) => handleOpeningHoursChange(day, 'isOpen', e.target.checked)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 w-20 text-gray-700 dark:text-gray-300">{day}</span>
                        </div>

                        {formData.opening_hours[day]?.isOpen && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={formData.opening_hours[day].openTime || ""}
                              onChange={(e) => handleOpeningHoursChange(day, 'openTime', e.target.value)}
                              className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={formData.opening_hours[day].closeTime || ""}
                              onChange={(e) => handleOpeningHoursChange(day, 'closeTime', e.target.value)}
                              className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-200">Contact Phone *</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      required
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                        errors.contact_phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.contact_phone && <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-200">Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                        errors.contact_email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Restaurant Features</label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {featureOptions.map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.features?.includes(feature) || false}
                          onChange={() => handleFeatureToggle(feature)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Media</h2>

                {/* Main Image */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Main Restaurant Image</label>
                  {formData.main_image && isString(formData.main_image) ? (
                    <div className="mt-2 flex items-center space-x-4">
                      <img
                        src={getImageUrl(formData.main_image, 'main')}
                        alt="Current main image"
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          console.error('Main image failed to load:', formData.main_image);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage('main_image')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : formData.main_image && isFile(formData.main_image) ? (
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-green-600">New image selected: {(formData.main_image as File).name}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingImage('main_image')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange('main_image')}
                      className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                    />
                  )}
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Gallery Images</label>

                  {/* Display existing gallery images */}
                  {formData.gallery_images.filter(img => isString(img)).length > 0 && (
                    <div className="mt-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Existing Images:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.gallery_images.map((img, index) =>
                          isString(img) ? (
                            <div key={index} className="relative">
                              <img
                                src={getImageUrl(img, `gallery-${index}`)}
                                alt={`Gallery ${index + 1}`}
                                className="h-20 w-20 object-cover rounded"
                                onError={(e) => {
                                  console.error(`Gallery image ${index} failed to load:`, img);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {/* Display new gallery images */}
                  {formData.gallery_images.filter(img => isFile(img)).length > 0 && (
                    <div className="mt-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">New Images:</h4>
                      <div className="space-y-2">
                        {formData.gallery_images.map((img, index) =>
                          isFile(img) ? (
                            <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                              <span className="text-green-600">{(img as File).name}</span>
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Owner Image */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Owner Image</label>
                  {formData.owner_image && isString(formData.owner_image) ? (
                    <div className="mt-2 flex items-center space-x-4">
                      <img
                        src={getImageUrl(formData.owner_image, 'owner')}
                        alt="Current owner image"
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          console.error('Owner image failed to load:', formData.owner_image);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage('owner_image')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : formData.owner_image && isFile(formData.owner_image) ? (
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-green-600">New image selected: {(formData.owner_image as File).name}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingImage('owner_image')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange('owner_image')}
                      className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                    />
                  )}
                </div>
              </div>

              {/* Owner Information Section */}
              <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Owner Information</h2>

                {/* Owner Full Name */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Full Name *</label>
                  <input
                    type="text"
                    name="owner_full_name"
                    required
                    value={formData.owner_full_name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                      errors.owner_full_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.owner_full_name && <p className="mt-1 text-sm text-red-600">{errors.owner_full_name}</p>}
                </div>

                {/* Owner Bio */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Biography *</label>
                  <textarea
                    name="owner_bio"
                    required
                    rows={4}
                    value={formData.owner_bio}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                      errors.owner_bio ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.owner_bio && <p className="mt-1 text-sm text-red-600">{errors.owner_bio}</p>}
                </div>
              </div>

              {/* Awards Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Awards & Recognition</h2>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Awards</h3>
                  <button
                    type="button"
                    onClick={addAward}
                    className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    Add Award
                  </button>
                </div>

                {(!formData.awards || formData.awards.length === 0) ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No awards added yet. Click "Add Award" to showcase achievements.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {formData.awards.map((award, index) => (
                      <div key={award.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">Award #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeAward(award.id)}
                            className="text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Award Title</label>
                            <input
                              type="text"
                              value={award.title}
                              onChange={(e) => updateAward(award.id, 'title', e.target.value)}
                              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Year</label>
                            <input
                              type="number"
                              value={award.year}
                              onChange={(e) => updateAward(award.id, 'year', e.target.value)}
                              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                          <textarea
                            value={award.description || ""}
                            onChange={(e) => updateAward(award.id, 'description', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Award Image</label>
                          {award.existing_image ? (
                            <div className="mt-2 flex items-center space-x-4">
                              <img
                                src={getImageUrl(award.existing_image, `award-${index}`)}
                                alt="Current award image"
                                className="h-20 w-20 object-cover rounded"
                                onError={(e) => {
                                  console.error(`Award image ${index} failed to load:`, award.existing_image);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <span className="text-gray-500">Existing image</span>
                            </div>
                          ) : award.image ? (
                            <div className="mt-2 flex items-center space-x-4">
                              <span className="text-green-600">New image selected: {(award.image as File).name}</span>
                              <button
                                type="button"
                                onClick={() => updateAward(award.id, 'image', null)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ) : null}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateAward(award.id, 'image', e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={route("restaurants.manage")}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/50 font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                >
                  Update Restaurant
                </button>
              </div>
            </div>
          </form>
        </div>
      </LoadScript>
    </DashboardLayout>
  );
};

export default EditRestaurant;
