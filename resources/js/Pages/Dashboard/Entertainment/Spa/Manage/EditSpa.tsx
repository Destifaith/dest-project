import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { GoogleMap, Marker, Autocomplete, LoadScript } from "@react-google-maps/api";
import { router, Link } from "@inertiajs/react";
import Select, { MultiValue } from "react-select";
import { Spa } from "../../../../../types";

const libraries: ("places")[] = ["places"];

interface Props {
  spa: Spa;
}

interface SelectOption {
  value: string;
  label: string;
}

const EditSpa: React.FC<Props> = ({ spa }) => {
  // Initialize gallery_images
  const initialGalleryImages = Array.isArray(spa.gallery_images)
    ? spa.gallery_images
    : typeof spa.gallery_images === 'string'
      ? JSON.parse(spa.gallery_images)
      : [];

  // Parse opening_hours if it's a string
  let parsedOpeningHours = spa.opening_hours;
  if (typeof spa.opening_hours === 'string') {
    try {
      parsedOpeningHours = JSON.parse(spa.opening_hours);
    } catch (e) {
      console.error('Error parsing opening_hours:', e);
      parsedOpeningHours = {};
    }
  }

  // Initialize opening_hours for all days
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const initialOpeningHours = daysOfWeek.reduce((acc, day) => ({
    ...acc,
    [day]: parsedOpeningHours[day] || { open: false, from: '09:00', to: '17:00' }
  }), {} as Record<string, { open: boolean; from: string; to: string }>);

  // Parse latitude and longitude with fallback
  const parsedLatitude = parseFloat(spa.latitude?.toString()) || 0;
  const parsedLongitude = parseFloat(spa.longitude?.toString()) || 0;

  const [formData, setFormData] = useState({
    location: spa.location || '',
    name: spa.name || '',
    description: spa.description || '',
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    treatment_type: spa.treatment_type ? spa.treatment_type.split(',').map(v => v.trim()) : [],
    ambiance_type: spa.ambiance_type ? spa.ambiance_type.split(',').map(v => v.trim()) : [],
    facilities: spa.facilities ? spa.facilities.split(',').map(v => v.trim()) : [],
    status: spa.status || 'active',
    price: spa.price || '',
    main_image: null as File | null,
    gallery_images: [] as File[],
    opening_hours: initialOpeningHours,
  });

  const [previewMainImage, setPreviewMainImage] = useState<string | null>(spa.main_image ? `/storage/${spa.main_image}` : null);
  const [previewGalleryImages, setPreviewGalleryImages] = useState<string[]>(initialGalleryImages.map((url: string) => url.startsWith('http') ? url : `/storage/${url}`));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImagesInputRef = useRef<HTMLInputElement>(null);

  // Options for multi-select fields
  const treatmentTypeOptions: SelectOption[] = [
    { value: 'Massage', label: 'Massage' },
    { value: 'Facial', label: 'Facial' },
    { value: 'Sauna', label: 'Sauna' },
    { value: 'Hydrotherapy', label: 'Hydrotherapy' },
  ];

  const ambianceTypeOptions: SelectOption[] = [
    { value: 'Relaxing', label: 'Relaxing' },
    { value: 'Luxury', label: 'Luxury' },
    { value: 'Modern', label: 'Modern' },
    { value: 'Traditional', label: 'Traditional' },
  ];

  const facilityOptions: SelectOption[] = [
    { value: 'Pool', label: 'Pool' },
    { value: 'Sauna', label: 'Sauna' },
    { value: 'Steam Room', label: 'Steam Room' },
    { value: 'Jacuzzi', label: 'Jacuzzi' },
    { value: 'Massage Rooms', label: 'Massage Rooms' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main_image' | 'gallery_images') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'main_image') {
      const file = files[0];
      setFormData((prev) => ({ ...prev, main_image: file }));
      setPreviewMainImage(URL.createObjectURL(file));
    } else {
      const newFiles = Array.from(files);
      setFormData((prev) => ({ ...prev, gallery_images: newFiles }));
      setPreviewGalleryImages(newFiles.map((file) => URL.createObjectURL(file)));
    }
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      setFormData((prev) => ({
        ...prev,
        location: place.formatted_address || prev.location,
        latitude: place.geometry!.location!.lat(),
        longitude: place.geometry!.location!.lng(),
      }));
    }
  };

  const handleOpeningHoursChange = (day: string, field: 'open' | 'from' | 'to', value: boolean | string) => {
    setFormData((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleMultiSelectChange = (name: string, selected: MultiValue<SelectOption>) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selected ? selected.map((option) => option.value) : [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (value !== null && value !== undefined) {
        if (key === 'opening_hours') {
          form.append(key, JSON.stringify(value));
        } else if (key === 'gallery_images') {
          (value as File[]).forEach((file, index) => {
            form.append(`gallery_images[${index}]`, file);
          });
        } else if (key === 'main_image' && value instanceof File) {
          form.append(key, value);
        } else if (['treatment_type', 'ambiance_type', 'facilities'].includes(key)) {
          form.append(key, (value as string[]).join(','));
        } else {
          form.append(key, value.toString());
        }
      }
    }

    router.post(`/spas/${spa.id}?_method=PUT`, form, {
      forceFormData: true,
      onSuccess: () => {
        setErrors({});
      },
      onError: (errors) => {
        setErrors(errors);
      },
    });
  };

  useEffect(() => {
    return () => {
      if (previewMainImage && previewMainImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewMainImage);
      }
      previewGalleryImages.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewMainImage, previewGalleryImages]);

  return (
    <DashboardLayout>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="px-4 lg:px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Spa</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update the details below to edit the spa.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                />
              </Autocomplete>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                rows={4}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location on Map
              </label>
              <GoogleMap
                mapContainerStyle={{ height: "400px", width: "100%" }}
                center={{ lat: formData.latitude, lng: formData.longitude }}
                zoom={15}
              >
                {formData.latitude !== 0 && formData.longitude !== 0 && (
                  <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                )}
              </GoogleMap>
              {errors.latitude && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.latitude}</p>
              )}
              {errors.longitude && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.longitude}</p>
              )}
            </div>

            {/* Treatment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Treatment Type
              </label>
              <Select
                isMulti
                name="treatment_type"
                options={treatmentTypeOptions}
                value={treatmentTypeOptions.filter(option => formData.treatment_type.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange('treatment_type', selected)}
                className="mt-1"
                classNamePrefix="select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    color: '#1f2937',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'white',
                    color: '#1f2937',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isFocused ? '#1f2937' : '#1f2937',
                  }),
                }}
              />
              {errors.treatment_type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.treatment_type}</p>
              )}
            </div>

            {/* Ambiance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ambiance Type
              </label>
              <Select
                isMulti
                name="ambiance_type"
                options={ambianceTypeOptions}
                value={ambianceTypeOptions.filter(option => formData.ambiance_type.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange('ambiance_type', selected)}
                className="mt-1"
                classNamePrefix="select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    color: '#1f2937',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'white',
                    color: '#1f2937',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isFocused ? '#1f2937' : '#1f2937',
                  }),
                }}
              />
              {errors.ambiance_type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ambiance_type}</p>
              )}
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Facilities
              </label>
              <Select
                isMulti
                name="facilities"
                options={facilityOptions}
                value={facilityOptions.filter(option => formData.facilities.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange('facilities', selected)}
                className="mt-1"
                classNamePrefix="select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    color: '#1f2937',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'white',
                    color: '#1f2937',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isFocused ? '#1f2937' : '#1f2937',
                  }),
                }}
              />
              {errors.facilities && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.facilities}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
              )}
            </div>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Main Image
              </label>
              {previewMainImage && (
                <img
                  src={previewMainImage}
                  alt="Main Image Preview"
                  className="mt-2 h-32 w-32 object-cover rounded-md"
                />
              )}
              <input
                type="file"
                name="main_image"
                ref={mainImageInputRef}
                onChange={(e) => handleFileChange(e, 'main_image')}
                className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-gray-700 hover:file:bg-primary/90"
              />
              {errors.main_image && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.main_image}</p>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gallery Images
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {previewGalleryImages.length > 0 ? (
                  previewGalleryImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Gallery Image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No gallery images available</p>
                )}
              </div>
              <input
                type="file"
                name="gallery_images"
                ref={galleryImagesInputRef}
                multiple
                onChange={(e) => handleFileChange(e, 'gallery_images')}
                className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-gray-700 hover:file:bg-primary/90"
              />
              {errors.gallery_images && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gallery_images}</p>
              )}
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opening Hours
              </label>
              <div className="mt-2 space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-32">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{day}</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.opening_hours[day]?.open || false}
                      onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.checked)}
                      className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <input
                      type="time"
                      value={formData.opening_hours[day]?.from || '09:00'}
                      onChange={(e) => handleOpeningHoursChange(day, 'from', e.target.value)}
                      disabled={!formData.opening_hours[day]?.open}
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                    />
                    <input
                      type="time"
                      value={formData.opening_hours[day]?.to || '17:00'}
                      onChange={(e) => handleOpeningHoursChange(day, 'to', e.target.value)}
                      disabled={!formData.opening_hours[day]?.open}
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                    />
                  </div>
                ))}
              </div>
              {errors.opening_hours && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.opening_hours}</p>
              )}
            </div>

            {/* Submit and Cancel */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/entertainment/spa/manage"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-gray-700 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Update Spa
              </button>
            </div>
          </form>
        </div>
      </LoadScript>
    </DashboardLayout>
  );
};

export default EditSpa;
