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

// Define types for our form data
interface Award {
  id: string;
  title: string;
  description: string;
  year: string;
  image: File | null;
}

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface EateryFormData {
  name: string;
  location: string;
  description: string;
  eatery_type: string;
  cuisine_type: string;
  opening_hours: OpeningHours;
  special_closure_days: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  capacity: string;
  features: string;
  latitude: string;
  longitude: string;
  has_daily_specials: boolean;
  daily_specials_email: string;
  main_image: File | null;
  gallery_images: File[];
  menu_pdf: File | null;
  owner_full_name: string;
  owner_bio: string;
  owner_experience_years: string;
  owner_specialties: string;
  owner_education: string;
  owner_image: File | null;
  awards: Award[];
  reservation_policy: string;
  price_range: string;
  service_type: string;
}

interface FormErrors {
  [key: string]: string;
}

const Eateries = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState<EateryFormData>({
    name: "",
    location: "",
    description: "",
    eatery_type: "",
    cuisine_type: "",
    opening_hours: {
      Monday: { isOpen: false, openTime: "", closeTime: "" },
      Tuesday: { isOpen: false, openTime: "", closeTime: "" },
      Wednesday: { isOpen: false, openTime: "", closeTime: "" },
      Thursday: { isOpen: false, openTime: "", closeTime: "" },
      Friday: { isOpen: false, openTime: "", closeTime: "" },
      Saturday: { isOpen: false, openTime: "", closeTime: "" },
      Sunday: { isOpen: false, openTime: "", closeTime: "" },
    },
    special_closure_days: "",
    contact_phone: "",
    contact_email: "",
    website: "",
    capacity: "",
    features: "",
    latitude: "",
    longitude: "",
    has_daily_specials: false,
    daily_specials_email: "",
    main_image: null,
    gallery_images: [],
    menu_pdf: null,
    owner_full_name: "",
    owner_bio: "",
    owner_experience_years: "",
    owner_specialties: "",
    owner_education: "",
    owner_image: null,
    awards: [],
    reservation_policy: "",
    price_range: "",
    service_type: ""
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Eatery type options for dropdown
  const eateryTypeOptions = [
    "Cafe", "Bakery", "Food Truck", "Bistro", "Deli", "Pizzeria",
    "Juice Bar", "Ice Cream Parlor", "Doughnut Shop", "Sandwich Shop",
    "Coffee Shop", "Tea House", "Patisserie", "Gelateria", "Creperie",
    "Smoothie Bar", "Breakfast Spot", "Brunch Cafe", "Dessert Parlor"
  ];

  // Cuisine options for dropdown
  const cuisineOptions = [
    "African", "American", "Asian", "BBQ", "Bakery", "Brazilian", "Breakfast",
    "British", "Burger", "Cafe", "Chinese", "Coffee", "Desserts", "French",
    "German", "Greek", "Indian", "Indonesian", "Italian", "Japanese", "Korean",
    "Lebanese", "Mediterranean", "Mexican", "Middle Eastern", "Pizza", "Seafood",
    "Spanish", "Steakhouse", "Sushi", "Thai", "Turkish", "Vegan", "Vegetarian",
    "Vietnamese", "Fusion", "Street Food", "Other"
  ];

  // Price range options
  const priceRangeOptions = [
    "$ - Budget Friendly",
    "$$ - Moderate",
    "$$$ - Expensive",
    "$$$$ - Fine Dining"
  ];

  // Service type options
  const serviceTypeOptions = [
    "Counter Service",
    "Table Service",
    "Takeaway Only",
    "Food Truck",
    "Delivery Only",
    "Self Service"
  ];

  // Features options for checkboxes
  const featureOptions = [
    "Outdoor Seating", "Free WiFi", "Parking", "Takeout", "Delivery",
    "Reservations", "Wheelchair Accessible", "Vegetarian Options",
    "Vegan Options", "Live Music", "Kid Friendly", "Pet Friendly",
    "Drive Through", "Free Refills", "Loyalty Program", "Catering"
  ];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Section validation functions
  const validateSection1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Eatery name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.eatery_type) newErrors.eatery_type = "Eatery type is required";
    if (!formData.latitude.trim()) newErrors.latitude = "Latitude is required";
    if (!formData.longitude.trim()) newErrors.longitude = "Longitude is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSection2 = (): boolean => {
    const newErrors: FormErrors = {};
    const hasOpenDays = Object.values(formData.opening_hours).some(day => day.isOpen);
    if (!hasOpenDays) newErrors.opening_hours = "At least one day must be selected as open";

    // Validate time inputs for open days
    Object.entries(formData.opening_hours).forEach(([day, hours]) => {
      if (hours.isOpen && (!hours.openTime || !hours.closeTime)) {
        newErrors[`${day}_time`] = `${day} requires both opening and closing times`;
      }
    });

    if (!formData.contact_phone.trim()) newErrors.contact_phone = "Contact phone is required";
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSection3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.has_daily_specials && !formData.daily_specials_email) {
      newErrors.daily_specials_email = "Daily specials email is required when daily specials updates are enabled";
    }
    if (formData.has_daily_specials && formData.daily_specials_email && !/\S+@\S+\.\S+/.test(formData.daily_specials_email)) {
      newErrors.daily_specials_email = "Daily specials email is invalid";
    }
    if (!formData.main_image) newErrors.main_image = "Main image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSection4 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.owner_full_name.trim()) newErrors.owner_full_name = "Owner full name is required";
    if (!formData.owner_bio.trim()) newErrors.owner_bio = "Owner bio is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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

  const handleOpeningHoursChange = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
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

    // Clear errors for this day
    if (errors[`${day}_time`] || errors.opening_hours) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${day}_time`];
        delete newErrors.opening_hours;
        return newErrors;
      });
    }
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = formData.features.split(",").map(f => f.trim()).filter(f => f);
    let newFeatures;

    if (currentFeatures.includes(feature)) {
      newFeatures = currentFeatures.filter(f => f !== feature);
    } else {
      newFeatures = [...currentFeatures, feature];
    }

    setFormData(prev => ({ ...prev, features: newFeatures.join(", ") }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, main_image: e.target.files?.[0] ?? null }));
    if (errors.main_image) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.main_image;
        return newErrors;
      });
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, gallery_images: e.target.files ? Array.from(e.target.files) : [] }));
  };

  const handleMenuPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, menu_pdf: e.target.files?.[0] ?? null }));
  };

  const handleOwnerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, owner_image: e.target.files?.[0] ?? null }));
  };

  // Award management functions
  const addAward = () => {
    const newAward: Award = {
      id: Date.now().toString(),
      title: "",
      description: "",
      year: "",
      image: null
    };
    setFormData(prev => ({ ...prev, awards: [...prev.awards, newAward] }));
  };

  const removeAward = (id: string) => {
    setFormData(prev => ({ ...prev, awards: prev.awards.filter(award => award.id !== id) }));
  };

  const updateAward = (id: string, field: keyof Award, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.map(award =>
        award.id === id ? { ...award, [field]: value } : award
      )
    }));
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
      name: place.name || prev.name,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    setMapCenter({ lat, lng });

    // Clear location errors
    if (errors.location || errors.latitude || errors.longitude) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        delete newErrors.latitude;
        delete newErrors.longitude;
        return newErrors;
      });
    }
  };

  const handleSectionComplete = (sectionNumber: number) => {
    let isValid = false;

    switch (sectionNumber) {
      case 1:
        isValid = validateSection1();
        break;
      case 2:
        isValid = validateSection2();
        break;
      case 3:
        isValid = validateSection3();
        break;
      case 4:
        isValid = validateSection4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCompletedSections(prev => [...prev.filter(s => s !== sectionNumber), sectionNumber]);
      if (sectionNumber < 5) {
        setCurrentSection(sectionNumber + 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all sections
    const allValid = validateSection1() && validateSection2() && validateSection3() && validateSection4();
    if (!allValid) {
      console.log("Form validation failed");
      return;
    }

    const data = new FormData();

    // Append basic fields
    data.append("name", formData.name);
    data.append("location", formData.location);
    data.append("description", formData.description);
    data.append("eatery_type", formData.eatery_type);
    data.append("cuisine_type", formData.cuisine_type);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("special_closure_days", formData.special_closure_days);
    data.append("contact_phone", formData.contact_phone);
    data.append("contact_email", formData.contact_email || "");
    data.append("website", formData.website || "");
    data.append("capacity", formData.capacity || "");
    data.append("reservation_policy", formData.reservation_policy);
    data.append("price_range", formData.price_range);
    data.append("service_type", formData.service_type);
    data.append("has_daily_specials", formData.has_daily_specials ? "1" : "0");
    data.append("daily_specials_email", formData.daily_specials_email || "");
    data.append("owner_full_name", formData.owner_full_name);
    data.append("owner_bio", formData.owner_bio);
    data.append("owner_experience_years", formData.owner_experience_years || "");
    data.append("owner_specialties", formData.owner_specialties || "");
    data.append("owner_education", formData.owner_education || "");

    // Append opening hours as JSON string
    data.append("opening_hours", JSON.stringify(formData.opening_hours));

    // Append features as JSON array
    const featuresArray = formData.features
      .split(",")
      .map(f => f.trim())
      .filter(f => f.length > 0);
    data.append("features", JSON.stringify(featuresArray));

    // Append main image
    if (formData.main_image) {
      data.append("main_image", formData.main_image);
    }

    // Append gallery images
    formData.gallery_images.forEach((file) => {
      data.append("gallery_images[]", file);
    });

    // Append menu PDF
    if (formData.menu_pdf) {
      data.append("menu_pdf", formData.menu_pdf);
    }

    // Append owner image
    if (formData.owner_image) {
      data.append("owner_image", formData.owner_image);
    }

    // Append awards as JSON
    const awardsData = formData.awards.map(award => ({
      title: award.title,
      description: award.description,
      year: award.year,
    }));
    data.append("awards", JSON.stringify(awardsData));

    // Append award images
    formData.awards.forEach((award, index) => {
      if (award.image) {
        data.append(`award_images[${index}]`, award.image);
      }
    });

    console.log("Submitting form data...");

    router.post(route("eateries.store"), data, {
                    onSuccess: () => {
                console.log("Eatries created successfully!");
                setSuccessMessage("Eatries created successfully!");
                // Reset form after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                    window.location.reload();
                }, 3000);
                },
      onError: (errors: any) => {
        console.error("Validation errors:", errors);

        // Handle Inertia error format
        if (errors) {
          const flattenedErrors: FormErrors = {};

          // Inertia returns errors in a flat object format
          Object.keys(errors).forEach(field => {
            if (field !== 'message' && field !== 'success') {
              flattenedErrors[field] = errors[field];
            }
          });

          setErrors(flattenedErrors);

          // Scroll to the first section with errors
          const firstErrorField = Object.keys(flattenedErrors)[0];
          if (firstErrorField) {
            if (firstErrorField.includes('name') || firstErrorField.includes('location') ||
                firstErrorField.includes('description') || firstErrorField.includes('eatery_type')) {
              setCurrentSection(1);
            } else if (firstErrorField.includes('opening_hours') || firstErrorField.includes('contact_')) {
              setCurrentSection(2);
            } else if (firstErrorField.includes('main_image') || firstErrorField.includes('daily_specials')) {
              setCurrentSection(3);
            } else if (firstErrorField.includes('owner_')) {
              setCurrentSection(4);
            }
          }
        }
      },
    });
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between w-full">
        {[1, 2, 3, 4, 5].map((section) => (
          <div key={section} className="flex items-center flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                completedSections.includes(section)
                  ? "bg-green-500 text-white"
                  : currentSection === section
                  ? "bg-primary text-gray-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {completedSections.includes(section) ? "✓" : section}
            </div>
            {section < 5 && (
              <div
                className={`flex-1 h-2 mx-4 rounded-full ${
                  completedSections.includes(section)
                    ? "bg-green-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400 px-2">
        <span className="text-center">Basic Info</span>
        <span className="text-center">Operations</span>
        <span className="text-center">Media</span>
        <span className="text-center">Owner</span>
        <span className="text-center">Review</span>
      </div>
    </div>
  );

  const renderSection1 = () => (
    <div className="space-y-6">
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

      {/* Eatery Name */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Eatery Name *</label>
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

      {/* Eatery Type */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Eatery Type *</label>
        <select
          name="eatery_type"
          required
          value={formData.eatery_type}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none ${
            errors.eatery_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <option value="">Select Eatery Type</option>
          {eateryTypeOptions.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.eatery_type && <p className="mt-1 text-sm text-red-600">{errors.eatery_type}</p>}
      </div>

      {/* Cuisine Type */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Cuisine Type</label>
        <select
          name="cuisine_type"
          value={formData.cuisine_type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
        >
          <option value="">Select Cuisine Type</option>
          {cuisineOptions.map((cuisine) => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>
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
          placeholder="Describe your eatery, its atmosphere, specialties, and what makes it unique..."
          className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
            errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Price Range and Service Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Price Range</label>
          <select
            name="price_range"
            value={formData.price_range}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">Select Price Range</option>
            {priceRangeOptions.map((range) => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Service Type</label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">Select Service Type</option>
            {serviceTypeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                errors[field] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
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
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Operations & Contact</h2>

      {/* Opening Hours */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-4">Opening Hours *</label>
        <div className="space-y-3">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.opening_hours[day].isOpen}
                  onChange={(e) => handleOpeningHoursChange(day, 'isOpen', e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-primary border-gray-800 rounded"
                />
                <span className="ml-2 w-20 text-gray-700 dark:text-gray-300">{day}</span>
              </div>

              {formData.opening_hours[day].isOpen && (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={formData.opening_hours[day].openTime}
                    onChange={(e) => handleOpeningHoursChange(day, 'openTime', e.target.value)}
                    className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.opening_hours[day].closeTime}
                    onChange={(e) => handleOpeningHoursChange(day, 'closeTime', e.target.value)}
                    className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {errors[`${day}_time`] && (
                <p className="text-sm text-red-600">{errors[`${day}_time`]}</p>
              )}
            </div>
          ))}
        </div>
        {errors.opening_hours && <p className="mt-1 text-sm text-red-600">{errors.opening_hours}</p>}
      </div>

      {/* Special Closure Days */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Special Closure Days (Holidays, etc.)</label>
        <textarea
          name="special_closure_days"
          value={formData.special_closure_days}
          onChange={handleChange}
          placeholder="e.g. Christmas Day, New Year's Day, etc."
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
        />
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
            value={formData.contact_email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
              errors.contact_email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
        </div>
      </div>

      {/* Website and Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Capacity (Number of Seats)</label>
          <input
            type="number"
            name="capacity"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Eatery Features</label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
          {featureOptions.map((feature) => (
            <label key={feature} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
                className="h-4 w-4 text-gray-900 focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reservation Policy */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Reservation Policy</label>
        <textarea
          name="reservation_policy"
          rows={3}
          value={formData.reservation_policy}
          onChange={handleChange}
          placeholder="e.g. Reservations recommended for weekends, walk-ins welcome, etc."
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
        />
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Media & Menu</h2>

      {/* Main Image */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Main Eatery Image *</label>
        <input
          type="file"
          name="main_image"
          accept="image/*"
          required
          onChange={handleMainImageChange}
          className={`mt-1 block w-full text-gray-900 dark:text-gray-100 ${
            errors.main_image ? "border-red-500" : ""
          }`}
        />
        {errors.main_image && <p className="mt-1 text-sm text-red-600">{errors.main_image}</p>}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This will be the primary image displayed for your eatery
        </p>
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload multiple images to showcase your eatery's ambiance, food, and facilities
        </p>
      </div>

      {/* Menu PDF */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Menu (PDF)</label>
        <input
          type="file"
          name="menu_pdf"
          accept=".pdf"
          onChange={handleMenuPdfChange}
          className="mt-1 block w-full text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload your menu as a PDF file
        </p>
      </div>

      {/* Daily Specials Updates */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="has_daily_specials"
              checked={formData.has_daily_specials}
              onChange={handleChange}
              className="h-4 w-4 text-gray-900 focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-2 font-medium text-gray-700 dark:text-gray-200">Enable Daily Specials Updates</span>
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            When enabled, the system will send daily emails to request updates for daily specials and availability
          </p>
        </div>

        {formData.has_daily_specials && (
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">Daily Specials Update Email *</label>
            <input
              type="email"
              name="daily_specials_email"
              value={formData.daily_specials_email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
                errors.daily_specials_email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.daily_specials_email && <p className="mt-1 text-sm text-red-600">{errors.daily_specials_email}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Daily specials update requests will be sent to this email address
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Owner/Chef Information</h2>

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

      {/* Owner Image */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Profile Photo</label>
        <input
          type="file"
          name="owner_image"
          accept="image/*"
          onChange={handleOwnerImageChange}
          className="mt-1 block w-full text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload a professional photo of the owner/chef
        </p>
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
          placeholder="Tell us about the owner's background, passion for food, and what makes them unique..."
          className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none ${
            errors.owner_bio ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.owner_bio && <p className="mt-1 text-sm text-red-600">{errors.owner_bio}</p>}
      </div>

      {/* Experience and Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Years of Experience</label>
          <input
            type="number"
            name="owner_experience_years"
            min="0"
            value={formData.owner_experience_years}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-200">Education/Training</label>
          <input
            type="text"
            name="owner_education"
            value={formData.owner_education}
            onChange={handleChange}
            placeholder="e.g. Culinary Institute, Barista Training, etc."
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Specialties */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-200">Culinary Specialties</label>
        <textarea
          name="owner_specialties"
          rows={3}
          value={formData.owner_specialties}
          onChange={handleChange}
          placeholder="e.g. Artisan coffee, French pastries, gourmet sandwiches, vegan desserts..."
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
        />
      </div>

      {/* Awards Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Awards & Recognition</h3>
          <button
            type="button"
            onClick={addAward}
            className="px-4 py-2 bg-primary text-gray-800 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Add Award
          </button>
        </div>

        {formData.awards.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No awards added yet. Click "Add Award" to showcase your achievements.
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
                      placeholder="e.g. Best Cafe 2023, Best Bakery Award"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Year</label>
                    <input
                      type="number"
                      value={award.year}
                      onChange={(e) => updateAward(award.id, 'year', e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                  <textarea
                    value={award.description}
                    onChange={(e) => updateAward(award.id, 'description', e.target.value)}
                    rows={3}
                    placeholder="Describe the award, who awarded it, and what it recognizes..."
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Award Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateAward(award.id, 'image', e.target.files?.[0] || null)}
                    className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Upload a photo of the certificate, trophy, or award ceremony
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Review & Submit</h2>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Summary</h3>

        <div className="space-y-4">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Eatery Name: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.name || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Eatery Type: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.eatery_type || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Location: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.location || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Cuisine Type: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.cuisine_type || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Price Range: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.price_range || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Service Type: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.service_type || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Owner: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.owner_full_name || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Contact: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.contact_phone || "Not provided"}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Awards: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.awards.length} award(s) added</span>
          </div>

          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Daily Specials Updates: </span>
            <span className="text-gray-900 dark:text-gray-100">{formData.has_daily_specials ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200">
          Please review all the information above before submitting. Once submitted, your eatery will be reviewed by our team before being published.
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="px-4 lg:px-8 xl:px-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add New Eatery</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete all sections to add your eatery to our platform
            </p>
          </div>

          {renderProgressBar()}

            {/* Success Message Bar */}
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

<form onSubmit={handleSubmit} className="space-y-8"></form>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
              {currentSection === 1 && renderSection1()}
              {currentSection === 2 && renderSection2()}
              {currentSection === 3 && renderSection3()}
              {currentSection === 4 && renderSection4()}
              {currentSection === 5 && renderSection5()}

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                  disabled={currentSection === 1}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentSection === 1
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-4">
                  {currentSection < 5 ? (
                    <button
                      type="button"
                      onClick={() => handleSectionComplete(currentSection)}
                      className="px-6 py-2 bg-primary text-gray-800 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    >
                      Next Section
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-medium"
                    >
                      Submit Eatery
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </LoadScript>
    </DashboardLayout>
  );
};

export default Eateries;
