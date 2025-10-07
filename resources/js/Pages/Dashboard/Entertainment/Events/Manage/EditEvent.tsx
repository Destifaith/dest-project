// resources/js/Pages/Dashboard/Entertainment/Events/Manage/EditEvent.tsx

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { router, Link } from "@inertiajs/react";
import { GoogleMap, Marker, Autocomplete, LoadScript } from "@react-google-maps/api";
import { Event } from "../../../../../types";

interface Props {
  event: Event;
}

const libraries: ("places")[] = ["places"];
const mapContainerStyle = { width: "100%", height: "400px" };

const eventTypes = ["Concert", "Conference", "Festival", "Sports", "Exhibition", "Workshop", "Networking", "Other"];
const statusOptions = ["active", "inactive", "sold_out", "cancelled"];
const timeSlots = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
  "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
];

const MAX_FILE_SIZE_KB = 2048;
const tagExamples = ["music", "tech", "food", "art", "business", "education", "health", "sports"];

const EditEvent: React.FC<Props> = ({ event }) => {

  // ✅ Robust datetime parser
  const parseDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateTimeString);
      return { date: "", time: "" };
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  const startParsed = parseDateTime(event.start_date);
  const endParsed = parseDateTime(event.end_date);

  const [startDate, setStartDate] = useState(startParsed.date);
  const [startTime, setStartTime] = useState(startParsed.time);
  const [endDate, setEndDate] = useState(endParsed.date);
  const [endTime, setEndTime] = useState(endParsed.time);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    latitude: event.latitude,
    longitude: event.longitude,
    event_type: event.event_type,
    organizer: event.organizer,
    contact_email: event.contact_email,
    contact_phone: event.contact_phone || "",
    website: event.website || "",
    price: event.price || "",
    capacity: event.capacity?.toString() || "",
    status: event.status,
    tags: event.tags || [],
    main_image: null as File | null,
    gallery_images: [] as File[],
  });

  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(event.gallery_images || []);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    event.main_image ? `/storage/${event.main_image}` : null
  );
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(
    (event.gallery_images || []).map((img) => `/storage/${img}`)
  );
  const [mapCenter, setMapCenter] = useState({
    lat: parseFloat(event.latitude),
    lng: parseFloat(event.longitude),
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentTag, setCurrentTag] = useState("");
  const [showTagExamples, setShowTagExamples] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>, type: "start" | "end") => {
    const { value } = e.target;
    if (type === "start") {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinEndDate = () => {
    return startDate || getMinDate();
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTag(e.target.value);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      const tag = currentTag.trim().toLowerCase();
      if (!formData.tags.includes(tag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
      setCurrentTag("");
      setShowTagExamples(false);
    }
  };

  const addExampleTag = (tag: string) => {
    const cleanTag = tag.toLowerCase();
    if (!formData.tags.includes(cleanTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, cleanTag],
      }));
    }
    setShowTagExamples(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > MAX_FILE_SIZE_KB * 1024) {
        setErrors((prev) => ({ ...prev, main_image: `File must be less than ${MAX_FILE_SIZE_KB / 1024}MB` }));
        return;
      }
      setFormData((prev) => ({ ...prev, main_image: file }));
      setMainImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, main_image: "" }));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE_KB * 1024);

    if (oversizedFiles.length > 0) {
      setErrors((prev) => ({ ...prev, gallery_images: `Some files exceed ${MAX_FILE_SIZE_KB / 1024}MB limit` }));
      return;
    }

    setFormData((prev) => ({ ...prev, gallery_images: [...prev.gallery_images, ...files] }));
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, gallery_images: "" }));

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
      setGalleryImagePreviews((prev) => {
        const newPreviews = prev.filter((_, i) => !(i < existingGalleryImages.length && i === index));
        return newPreviews;
      });
    } else {
      const actualIndex = index - existingGalleryImages.length;
      setFormData((prev) => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== actualIndex),
      }));
      setGalleryImagePreviews((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      location: place.formatted_address || "",
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    setMapCenter({ lat, lng });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate time is selected
    if (!startTime || !endTime) {
      alert("Please select both start and end times.");
      return;
    }

    const submitData = new FormData();
    submitData.append("_method", "PUT");

    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("location", formData.location);
    submitData.append("latitude", formData.latitude);
    submitData.append("longitude", formData.longitude);
    submitData.append("start_date", `${startDate} ${startTime}`);
    submitData.append("end_date", `${endDate} ${endTime}`);
    submitData.append("event_type", formData.event_type);
    submitData.append("organizer", formData.organizer);
    submitData.append("contact_email", formData.contact_email);
    if (formData.contact_phone) submitData.append("contact_phone", formData.contact_phone);
    if (formData.website) submitData.append("website", formData.website);
    if (formData.price) submitData.append("price", formData.price);
    if (formData.capacity) submitData.append("capacity", formData.capacity);
    submitData.append("status", formData.status);

    formData.tags.forEach((tag) => {
      submitData.append("tags[]", tag);
    });

    existingGalleryImages.forEach((img) => {
      submitData.append("existing_gallery_images[]", img);
    });

    if (formData.main_image) {
      submitData.append("main_image", formData.main_image);
    }

    formData.gallery_images.forEach((file) => {
      submitData.append("gallery_images[]", file);
    });

    router.put(`/events/${event.id}`, submitData, {
      onSuccess: () => {
        router.get("/dashboard/entertainment/events/manage");
      },
      onError: (errors) => {
        setErrors(errors);
      },
    });
  };

  return (
    <DashboardLayout>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="px-4 lg:px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Event</h1>
            <Link
              href="/dashboard/entertainment/events/manage"
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Back to Events
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Event Type *</label>
                <select
                  name="event_type"
                  required
                  value={formData.event_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Event Type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.event_type && <p className="text-red-500 text-sm mt-1">{errors.event_type}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  min={getMinDate()}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {!startDate && <p className="text-red-500 text-sm mt-1">Invalid or missing start date</p>}
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}

                <label className="block font-medium text-gray-700 dark:text-gray-200 mt-4">Start Time *</label>
                <select
                  required
                  value={startTime}
                  onChange={(e) => handleTimeChange(e, "start")}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {!startTime && <p className="text-red-500 text-sm mt-1">Please select start time</p>}
                {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={getMinEndDate()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {!endDate && <p className="text-red-500 text-sm mt-1">Invalid or missing end date</p>}
                {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}

                <label className="block font-medium text-gray-700 dark:text-gray-200 mt-4">End Time *</label>
                <select
                  required
                  value={endTime}
                  onChange={(e) => handleTimeChange(e, "end")}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {!endTime && <p className="text-red-500 text-sm mt-1">Please select end time</p>}
                {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
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
                  placeholder="Search for a location..."
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </Autocomplete>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Latitude *</label>
                <input
                  type="number"
                  name="latitude"
                  required
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Longitude *</label>
                <input
                  type="number"
                  name="longitude"
                  required
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
              </div>
            </div>

            {/* Map Preview */}
            <div className="h-96 w-full rounded-lg overflow-hidden">
              <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={13}>
                <Marker position={mapCenter} />
              </GoogleMap>
            </div>

            {/* Organizer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Organizer *</label>
                <input
                  type="text"
                  name="organizer"
                  required
                  value={formData.organizer}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.organizer && <p className="text-red-500 text-sm mt-1">{errors.organizer}</p>}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="0"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Tags</label>
              <div className="relative">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={currentTag}
                  onChange={handleTagInput}
                  onKeyDown={addTag}
                  onFocus={() => setShowTagExamples(true)}
                  onBlur={() => setTimeout(() => setShowTagExamples(false), 200)}
                  placeholder="Type a tag and press Enter"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                {showTagExamples && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-600">
                    <div className="p-2 text-xs text-gray-500 dark:text-gray-400">Example tags (click to add):</div>
                    <div className="p-2 flex flex-wrap gap-2">
                      {tagExamples.map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addExampleTag(tag)}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900 dark:hover:text-blue-100 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1.5 rounded-full flex-shrink-0"
                    >
                      <span className="sr-only">Remove tag</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add tags to help people find your event. Press Enter after each tag.
              </p>
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>

            {/* Main Image */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Main Image</label>
              <input
                type="file"
                name="main_image"
                accept="image/*"
                onChange={handleMainImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-100"
              />
              {errors.main_image && <p className="text-red-500 text-sm mt-1">{errors.main_image}</p>}
              {mainImagePreview && (
                <div className="mt-2">
                  <img src={mainImagePreview} alt="Main preview" className="h-40 object-cover rounded-md" />
                </div>
              )}
              {event.main_image && !formData.main_image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current image:</p>
                  <img
                    src={`/storage/${event.main_image}`}
                    alt="Current main"
                    className="h-40 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/placeholder-event.jpg";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200">Gallery Images</label>
              <input
                ref={galleryInputRef}
                type="file"
                name="gallery_images"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-100"
              />
              {errors.gallery_images && <p className="text-red-500 text-sm mt-1">{errors.gallery_images}</p>}
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {existingGalleryImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={`/storage/${img}`}
                      alt={`Gallery ${index}`}
                      className="h-32 w-full object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder-event.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index, true)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {galleryImagePreviews.slice(existingGalleryImages.length).map((preview, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img src={preview} alt={`New preview ${index}`} className="h-32 w-full object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(existingGalleryImages.length + index, false)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between">
              <Link
                href="/dashboard/entertainment/events/manage"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Update Event
              </button>
            </div>
          </form>
        </div>
      </LoadScript>
    </DashboardLayout>
  );
};

export default EditEvent;
