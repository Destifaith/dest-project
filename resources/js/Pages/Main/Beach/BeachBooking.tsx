// Main/Beach/BeachBooking.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { router } from '@inertiajs/react';
import MainLayout from "@/Pages/Layouts/MainLayout";

// Update the getImageUrl function to return a string instead of string | null
const getImageUrl = (beach: BeachProps['beach'] | null): string => {
  if (!beach) return "/path/to/placeholder/image.jpg";

  if (beach.mainImage && beach.mainImage.url) {
    return beach.mainImage.url;
  }

  if (beach.main_image && beach.main_image.image_path) {
    return `/storage/${beach.main_image.image_path}`;
  }

  return "/path/to/placeholder/image.jpg";
};

// Define a type for the formData state object
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  alternatePickup: string;
  homeAddress: string;
  gender: string;
  preferredDate: string;
  adults: string;
  children: string;
  specialRequest: string;
  total: string; // ✅ Add this field
};

// Define a type for the errors state object
// Define a type for the errors state object
type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  alternatePickup?: string;
  homeAddress?: string;
  gender?: string;
  preferredDate?: string;
  adults?: string;
  children?: string;
  specialRequest?: string;
  total?: string; // ✅ Add this field to match FormData
};

// Define types for the beach prop
interface BeachImage {
  url: string;
}

interface BeachProps {
  beach: {
    id: number;
    name: string;
    location: string;
    price: number;
    mainImage: BeachImage;
    main_image?: {
      image_path: string;
    };
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

// Weather data type
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

// Tide data type
interface TideData {
  highTide: string;
  lowTide: string;
  nextHigh: string;
  nextLow: string;
}

// Country data with flags and phone codes
const countries = [
  { code: "GH", name: "Ghana", flag: "🇬🇭", phoneCode: "+233" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", phoneCode: "+234" },
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44" },
  { code: "CA", name: "Canada", flag: "🇨🇦", phoneCode: "+1" },
  { code: "FR", name: "France", flag: "🇫🇷", phoneCode: "+33" },
  { code: "DE", name: "Germany", flag: "🇩🇪", phoneCode: "+49" },
  { code: "AU", name: "Australia", flag: "🇦🇺", phoneCode: "+61" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", phoneCode: "+27" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", phoneCode: "+254" },
];

const BeachBooking = ({ beach }: BeachProps) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    alternatePickup: "",
    homeAddress: "",
    gender: "male",
    preferredDate: "",
    adults: "1",
    children: "0",
    specialRequest: "",
    total: "0.00" // ✅ Add initial value
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showAdultsDropdown, setShowAdultsDropdown] = useState(false);
  const [showChildrenDropdown, setShowChildrenDropdown] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // New state for weather, tides, and map
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [tideLoading, setTideLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const alternatePickupRef = useRef<HTMLInputElement>(null);
  const homeAddressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const adultsDropdownRef = useRef<HTMLDivElement>(null);
  const childrenDropdownRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate prices
  const adultPrice = typeof beach.price === 'string' ? parseFloat(beach.price) : beach.price || 50;
  const childPrice = adultPrice * 0.7;
  const numAdults = parseInt(formData.adults) || 0;
  const numChildren = parseInt(formData.children) || 0;

  // Calculate subtotals
  const adultSubtotal = numAdults * adultPrice;
  const childSubtotal = numChildren * childPrice;
  const subtotal = adultSubtotal + childSubtotal;

  // Calculate tax (10% of subtotal, minimum $2)
  const tax = subtotal > 0 ? Math.max(subtotal * 0.1, 2) : 0;

  // Calculate total
  const total = subtotal + tax;

  // Default coordinates (Accra, Ghana) if beach coordinates not provided
  const beachCoords = beach.coordinates || { lat: 5.6037, lng: -0.1870 };

  // Update total in formData whenever prices change
  useEffect(() => {
    const adultPrice = typeof beach.price === 'string' ? parseFloat(beach.price) : beach.price || 50;
    const childPrice = adultPrice * 0.7;
    const numAdults = parseInt(formData.adults) || 0;
    const numChildren = parseInt(formData.children) || 0;

    const adultSubtotal = numAdults * adultPrice;
    const childSubtotal = numChildren * childPrice;
    const subtotal = adultSubtotal + childSubtotal;
    const tax = subtotal > 0 ? Math.max(subtotal * 0.1, 2) : 0;
    const calculatedTotal = subtotal + tax;

    // ✅ Update the total in formData whenever it changes
    setFormData(prev => ({
      ...prev,
      total: calculatedTotal.toFixed(2)
    }));
  }, [formData.adults, formData.children, beach.price]);

  // Fetch weather data based on selected date
  const fetchWeatherData = async (date: string) => {
    if (!date) return;

    setWeatherLoading(true);
    try {
      // Using a free weather API (you'll need to replace with your preferred service)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${beachCoords.lat}&lon=${beachCoords.lng}&appid=YOUR_API_KEY&units=metric`
      );

      if (response.ok) {
        const data = await response.json();
        setWeatherData({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          icon: data.weather[0].icon
        });
      } else {
        // Fallback with mock data
        setWeatherData({
          temperature: 28,
          condition: "Partly cloudy",
          humidity: 75,
          windSpeed: 15,
          icon: "02d"
        });
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Fallback with mock data
      setWeatherData({
        temperature: 28,
        condition: "Partly cloudy",
        humidity: 75,
        windSpeed: 15,
        icon: "02d"
      });
    }
    setWeatherLoading(false);
  };

  // Fetch tide data based on selected date
  const fetchTideData = async (date: string) => {
    if (!date) return;

    setTideLoading(true);
    try {
      // Using a tide API (you'll need to replace with your preferred service)
      // For now, using mock data as most tide APIs require payment
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setTideData({
        highTide: "06:30",
        lowTide: "12:45",
        nextHigh: "18:50",
        nextLow: "01:15"
      });
    } catch (error) {
      console.error('Tide fetch error:', error);
      setTideData({
        highTide: "06:30",
        lowTide: "12:45",
        nextHigh: "18:50",
        nextLow: "01:15"
      });
    }
    setTideLoading(false);
  };

  // Initialize Google Map
  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: beachCoords,
        zoom: 15,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#4A90E2" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          }
        ]
      });

      // Add marker for the beach
      new window.google.maps.Marker({
        position: beachCoords,
        map: map,
        title: beach.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4A90E2" width="32" height="32">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #333;">${beach.name}</h3>
            <p style="margin: 0; color: #666;">${beach.location}</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; color: #4A90E2;">$${adultPrice}/adult</p>
          </div>
        `
      });

      const marker = new window.google.maps.Marker({
        position: beachCoords,
        map: map,
        title: beach.name
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      setMapError(null);
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Unable to load map. Please check your internet connection.');
    }
  };

  // Validate children selection (children can't be selected without adults)
  useEffect(() => {
    if (numChildren > 0 && numAdults === 0) {
      setChildrenError("Children cannot be booked without adults");
    } else {
      setChildrenError("");
    }
  }, [numAdults, numChildren]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (adultsDropdownRef.current && !adultsDropdownRef.current.contains(event.target as Node)) {
        setShowAdultsDropdown(false);
      }
      if (childrenDropdownRef.current && !childrenDropdownRef.current.contains(event.target as Node)) {
        setShowChildrenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeAutocomplete();
      initializeMap();
    } else {
      loadGoogleMapsScript();
    }
  }, [selectedCountry]);

  // Fetch weather and tide data when date changes
  useEffect(() => {
    if (formData.preferredDate) {
      fetchWeatherData(formData.preferredDate);
      fetchTideData(formData.preferredDate);
    }
  }, [formData.preferredDate]);

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCzYx-MMzEhUzQeJfTwkRSfPqeVCWDKWSo&libraries=places`;
      script.onload = () => {
        initializeAutocomplete();
        initializeMap();
      };
      document.head.appendChild(script);
    }
  };

  const initializeAutocomplete = () => {
    if (!window.google || !window.google.maps) return;

    const options = {
      componentRestrictions: { country: selectedCountry.code }
    };

    if (alternatePickupRef.current) {
      new window.google.maps.places.Autocomplete(alternatePickupRef.current, options);
    }
    if (homeAddressRef.current) {
      new window.google.maps.places.Autocomplete(homeAddressRef.current, options);
    }
    if (cityRef.current) {
      new window.google.maps.places.Autocomplete(cityRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: selectedCountry.code }
      });
    }
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation based on selected country
  const validatePhone = (phone: string, countryCode: string): boolean => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (countryCode === "+233") { // Ghana
      return /^\+233\d{9}$/.test(cleanPhone);
    } else if (countryCode === "+234") { // Nigeria
      return /^\+234\d{10}$/.test(cleanPhone);
    } else if (countryCode === "+1") { // US/Canada
      return /^\+1\d{10}$/.test(cleanPhone);
    } else if (countryCode === "+44") { // UK
      return /^\+44\d{10,11}$/.test(cleanPhone);
    }
    return /^\+\d{1,4}\d{7,15}$/.test(cleanPhone);
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    }

    if (field === 'phone' && value) {
      if (!validatePhone(value, selectedCountry.phoneCode)) {
        setErrors(prev => ({
          ...prev,
          phone: `Please enter a valid phone number for ${selectedCountry.name}`
        }));
      } else {
        setErrors(prev => ({ ...prev, phone: undefined }));
      }
    }

    // Validate children selection when adults or children change
    if ((field === 'adults' || field === 'children') && childrenError) {
      const adults = field === 'adults' ? parseInt(value) || 0 : numAdults;
      const children = field === 'children' ? parseInt(value) || 0 : numChildren;

      if (children > 0 && adults === 0) {
        setChildrenError("Children cannot be booked without adults");
      } else {
        setChildrenError("");
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone, selectedCountry.phoneCode)) newErrors.phone = `Please enter a valid phone number for ${selectedCountry.name}`;
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (numChildren > 0 && numAdults === 0) newErrors.children = "Children cannot be booked without adults";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
        // Prepare the cart item data - ✅ Send TOTAL as subtotal to fix cart display
        const cartItemData = {
            type: 'beach',
            beach_id: beach.id,
            beach_name: beach.name,
            beach_location: beach.location,
            beach_image_url: getImageUrl(beach),
            adult_price: adultPrice,
            child_price: childPrice,
            adults: parseInt(formData.adults),
            children: parseInt(formData.children),
            preferred_date: formData.preferredDate,
            subtotal: parseFloat(formData.total), // ✅ Send TOTAL as subtotal
            total: parseFloat(formData.total), // ✅ Still send total
            tax: tax, // ✅ Keep tax for reference

            // Customer fields
            customer_first_name: formData.firstName,
            customer_last_name: formData.lastName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_country: formData.country,
            customer_city: formData.city,
            customer_address: formData.homeAddress || formData.alternatePickup || '',
        };

        console.log('🔄 Sending beach booking data:', cartItemData);
        console.log('💰 Subtotal being sent (ACTUALLY TOTAL):', formData.total);
        console.log('💰 Tax being sent:', tax);
        console.log('💰 Total being sent:', formData.total);

        // Send data to Laravel backend to add to cart
        await router.post('/cart', cartItemData, {
            onSuccess: () => {
                console.log('✅ Successfully added beach booking to cart');
                router.visit('/cart');
            },
            onError: (errors: Record<string, string>) => {
                console.error('❌ Failed to add beach booking to cart:', errors);
                alert('Failed to add item to cart. Please try again.');
            }
        });

    } catch (error) {
        console.error("💥 Error adding to cart:", error);
        alert("An unexpected error occurred. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
};

  // Weather Icon Component
  const WeatherIcon = ({ condition }: { condition: string }) => {
    if (condition.includes('rain')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M12,4A5,5 0 0,1 17,9C17,10.64 16.05,12.08 14.66,12.93L14,13.31V16H10V13.31L9.34,12.93C7.95,12.08 7,10.64 7,9A5,5 0 0,1 12,4M8.5,20V22H9.5V20H14.5V22H15.5V20H8.5Z"/>
        </svg>
      );
    } else if (condition.includes('cloud')) {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.5,20Q4.22,20 2.61,18.43Q1,16.85 1,14.58Q1,12.63 2.17,11.1Q3.35,9.57 5.25,9.15Q5.88,6.85 7.75,5.43Q9.63,4 12,4Q14.93,4 16.96,6.04Q19,8.07 19,11Q20.73,11.2 21.86,12.5Q23,13.78 23,15.5Q23,17.38 21.69,18.69Q20.38,20 18.5,20H6.5M6.5,18H18.5Q19.46,18 20.23,17.23Q21,16.46 21,15.5Q21,14.54 20.23,13.77Q19.46,13 18.5,13H17V11Q17,8.79 15.61,7.39Q14.21,6 12,6Q9.79,6 8.39,7.39Q7,8.79 7,11H6.5Q5.12,11 4.06,12.06Q3,13.12 3,14.5Q3,15.88 4.06,16.94Q5.12,18 6.5,18Z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,15.31L23.31,12L20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31Z"/>
        </svg>
      );
    }
  };

  if (bookingSuccess) {
    return (
      <MainLayout>
        <div className="bg-gray-100 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your booking for {beach.name} has been confirmed. A confirmation email has been sent to {formData.email}.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
                <p className="text-gray-600">{formData.adults} Adult(s), {formData.children} Child(ren)</p>
                <p className="text-gray-600">Date: {new Date(formData.preferredDate).toLocaleDateString()}</p>
                <p className="text-gray-600 font-bold mt-2">Total: ${formData.total}</p>
              </div>
              <button
                onClick={() => setBookingSuccess(false)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-6 px-4">
          <div className="hidden lg:block lg:col-span-1 space-y-6 lg:order-1">

            {/* Relocated Booking Details Section */}
           <section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-4 text-white">Booking Details</h2>
  <div className="flex flex-col items-center">
    {/* Full-width image div */}
    <div className="w-full h-48 sm:h-64 flex-shrink-0 rounded-lg overflow-hidden">
      {beach && (
        <img
          src={getImageUrl(beach)}
          alt={beach.name}
          className="w-full h-full object-cover"
        />
      )}
    </div>

    {/* Content div */}
    <div className="w-full mt-4 text-center">
      <h3 className="text-lg font-semibold text-white">{beach?.name}</h3>
      <p className="text-sm text-gray-400 uppercase">{beach?.location}</p>
      <button className="mt-2 text-sm text-gray-300 border border-gray-600 rounded-full px-4 py-1 hover:bg-gray-700">
        CHANGE
      </button>
      <div className="mt-4 flex items-center justify-center">
        {/* Star ratings */}
        <div className="flex text-yellow-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" />
          </svg>
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" />
          </svg>
        </div>
        <span className="ml-2 text-sm text-gray-400">0 REVIEWS</span>
      </div>
    </div>
  </div>
</section>

            {/* Updated Price Information Section */}
           <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Price Information</h2>
  <div className="space-y-3">
    <div className="flex justify-between text-gray-700 dark:text-gray-300">
      <span>Price per Adult:</span>
      <span className="font-semibold">${adultPrice.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-gray-700 dark:text-gray-300">
      <span>Price per Child:</span>
      <span className="font-semibold">${childPrice.toFixed(2)}</span>
    </div>
    {numAdults > 0 && (
      <div className="flex justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300">
        <span>Adults ({numAdults}):</span>
        <span className="font-semibold">${adultSubtotal.toFixed(2)}</span>
      </div>
    )}
    {numChildren > 0 && (
      <div className="flex justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300">
        <span>Children ({numChildren}):</span>
        <span className="font-semibold">${childSubtotal.toFixed(2)}</span>
      </div>
    )}
    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 text-gray-700 dark:text-gray-300">
      <span>Subtotal:</span>
      <span className="font-semibold">${subtotal.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-gray-700 dark:text-gray-300">
      <span>Tax (10%):</span>
      <span className="font-semibold">${tax.toFixed(2)}</span>
    </div>
    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 font-bold text-lg text-green-600 dark:text-green-400">
      <span>Total:</span>
      <span>${formData.total}</span>
    </div>
  </div>
</section>
<section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-4 text-white">Cancellation Policy</h2>
  <div className="space-y-2 text-sm text-gray-300">
    <div className="flex justify-between">
      <span>Can I Cancel:</span>
      <span className="text-green-400 font-bold">YES</span>
    </div>
    <div className="flex justify-between">
      <span>Cost to Cancel:</span>
      <span className="text-green-400 font-bold">${(parseFloat(formData.total) * 0.1).toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span>Cancel for Free Till:</span>
      <span className="text-green-400 font-bold">24 Hours Before</span>
    </div>
  </div>
</section>

            {/* Enhanced Weather & Tides Section */}
          <section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-4 text-white">Weather & Tides</h2>

  {/* Weather Information */}
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3 text-gray-300">Weather Forecast</h3>
    {!formData.preferredDate ? (
      <div className="bg-blue-900 p-4 rounded-lg">
        <p className="text-blue-300 text-sm">Select a preferred date to see weather forecast</p>
      </div>
    ) : weatherLoading ? (
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <p className="text-gray-400 text-sm">Loading weather data...</p>
        </div>
      </div>
    ) : weatherData ? (
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <WeatherIcon condition={weatherData.condition} />
            <div>
              <p className="text-2xl font-bold text-white">{weatherData.temperature}°C</p>
              <p className="text-sm text-gray-400 capitalize">{weatherData.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">
              {new Date(formData.preferredDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A7,7 0 0,1 19,9C19,10.38 18.5,11.65 17.65,12.65L12,22L6.35,12.65C5.5,11.65 5,10.38 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,9.64 7.2,10.25 7.56,10.75L12,18.1L16.44,10.75C16.8,10.25 17,9.64 17,9A5,5 0 0,0 12,4Z"/>
            </svg>
            <span className="text-gray-400">Humidity: {weatherData.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,13A1,1 0 0,0 19,14H5A3,3 0 0,1 2,11A3,3 0 0,1 5,8H6A1,1 0 0,0 7,7A1,1 0 0,0 6,6H5A5,5 0 0,0 0,11A5,5 0 0,0 5,16H19A3,3 0 0,1 22,19A3,3 0 0,1 19,22H17A1,1 0 0,1 16,21A1,1 0 0,1 17,20H19A1,1 0 0,0 20,19A1,1 0 0,0 19,18H5A3,3 0 0,0 2,15A3,3 0 0,0 5,12H19Z"/>
            </svg>
            <span className="text-gray-400">Wind: {weatherData.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-red-900 p-4 rounded-lg">
        <p className="text-red-300 text-sm">Unable to load weather data</p>
      </div>
    )}
  </div>

  {/* Tide Information */}
  <div>
    <h3 className="text-lg font-semibold mb-3 text-gray-300">Tide Times</h3>
    {!formData.preferredDate ? (
      <div className="bg-blue-900 p-4 rounded-lg">
        <p className="text-blue-300 text-sm">Select a preferred date to see tide information</p>
      </div>
    ) : tideLoading ? (
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <p className="text-gray-400 text-sm">Loading tide data...</p>
        </div>
      </div>
    ) : tideData ? (
      <div className="bg-gradient-to-r from-teal-900 to-blue-900 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A7,7 0 0,1 19,9H17A5,5 0 0,0 12,4A5,5 0 0,0 7,9H5A7,7 0 0,1 12,2M5,9H19A3,3 0 0,1 22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A3,3 0 0,1 5,9Z"/>
              </svg>
              <span className="font-medium text-gray-300">High Tide</span>
            </div>
            <span className="font-bold text-blue-400">{tideData.highTide}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5,9A3,3 0 0,1 8,6H16A3,3 0 0,1 19,9V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V9M7,9V20H17V9A1,1 0 0,0 16,8H8A1,1 0 0,0 7,9Z"/>
              </svg>
              <span className="font-medium text-gray-300">Low Tide</span>
            </div>
            <span className="font-bold text-orange-400">{tideData.lowTide}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A7,7 0 0,1 19,9H17A5,5 0 0,0 12,4A5,5 0 0,0 7,9H5A7,7 0 0,1 12,2M5,9H19A3,3 0 0,1 22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A3,3 0 0,1 5,9Z"/>
              </svg>
              <span className="text-xs text-gray-400">Next High</span>
            </div>
            <span className="text-sm font-semibold text-blue-400">{tideData.nextHigh}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5,9A3,3 0 0,1 8,6H16A3,3 0 0,1 19,9V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V9M7,9V20H17V9A1,1 0 0,0 16,8H8A1,1 0 0,0 7,9Z"/>
              </svg>
              <span className="text-xs text-gray-400">Next Low</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">{tideData.nextLow}</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400 text-center">
          Times are in local timezone for {beach.location}
        </div>
      </div>
    ) : (
      <div className="bg-red-900 p-4 rounded-lg">
        <p className="text-red-300 text-sm">Unable to load tide data</p>
      </div>
    )}
  </div>
            </section>

            {/* Enhanced Map Section */}
            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-4 text-white">Location Map</h2>
  {mapError ? (
    <div className="bg-red-900 p-4 rounded-lg">
      <p className="text-red-300 text-sm">{mapError}</p>
      <button
        onClick={initializeMap}
        className="mt-2 text-sm text-red-400 hover:text-red-200 underline"
      >
        Try to reload map
      </button>
    </div>
  ) : (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-lg border border-gray-600"
      style={{ minHeight: '256px' }}
    >
      <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    </div>
  )}
  <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
    <span>📍 {beach.location}</span>
    <button
      onClick={() => window.open(`https://maps.google.com/?q=${beachCoords.lat},${beachCoords.lng}`, '_blank')}
      className="text-blue-400 hover:text-blue-200 underline"
    >
      Open in Google Maps
    </button>
  </div>
            </section>

          </div>

          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            {childrenError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {childrenError}
              </div>
            )}
<section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-white mb-6">Your Personal Information</h2>

  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">FIRST NAME *</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          className={`w-full p-3 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
            errors.firstName ? 'border-red-400' : 'border-gray-600'
          }`}
        />
        {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">LAST NAME *</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          className={`w-full p-3 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
            errors.lastName ? 'border-red-400' : 'border-gray-600'
          }`}
        />
        {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">EMAIL ADDRESS *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full p-3 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
            errors.email ? 'border-red-400' : 'border-gray-600'
          }`}
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">PHONE NUMBER *</label>
        <div className="flex relative" ref={countryDropdownRef}>
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="flex items-center bg-gray-700 border border-r-0 border-gray-600 rounded-l-md px-3 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
          >
            <span className="mr-2">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.phoneCode}</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showCountryDropdown && (
            <div className="absolute top-full left-0 z-10 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto w-64">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountryDropdown(false);
                    if (formData.phone) {
                      handleInputChange('phone', formData.phone);
                    }
                  }}
                  className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-600 focus:outline-none focus:bg-gray-600 text-white"
                >
                  <span className="mr-3">{country.flag}</span>
                  <span className="mr-3 font-medium">{country.phoneCode}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))}
            </div>
          )}
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="23 123 4567"
            className={`flex-1 p-3 border rounded-r-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
              errors.phone ? 'border-red-400' : 'border-gray-600'
            }`}
          />
        </div>
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">COUNTRY *</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className={`w-full p-3 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
            errors.country ? 'border-red-400' : 'border-gray-600'
          }`}
        />
        {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">CITY/TOWN *</label>
        <input
          ref={cityRef}
          type="text"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className={`w-full p-3 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
            errors.city ? 'border-red-400' : 'border-gray-600'
          }`}
        />
        {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">ALTERNATE PICK UP LOCATION</label>
        <input
          ref={alternatePickupRef}
          type="text"
          value={formData.alternatePickup}
          onChange={(e) => handleInputChange('alternatePickup', e.target.value)}
          className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">HOME ADDRESS</label>
        <input
          ref={homeAddressRef}
          type="text"
          value={formData.homeAddress}
          onChange={(e) => handleInputChange('homeAddress', e.target.value)}
          className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">GENDER</label>
        <div className="flex items-center space-x-4 mt-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-4 h-4 text-green-400 border-gray-600 focus:ring-green-400 bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-300">Male</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-4 h-4 text-green-400 border-gray-600 focus:ring-green-400 bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-300">Female</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">PREFERRED DATE *</label>
        <input
          type="date"
          value={formData.preferredDate}
          onChange={(e) => handleInputChange('preferredDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full p-3 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
            errors.preferredDate ? 'border-red-400' : 'border-gray-600'
          }`}
        />
        {errors.preferredDate && <p className="text-red-400 text-sm mt-1">{errors.preferredDate}</p>}
      </div>

      <div ref={adultsDropdownRef}>
        <label className="block text-sm font-medium text-gray-400 mb-2">NO. OF ADULTS *</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAdultsDropdown(!showAdultsDropdown)}
            className="w-full flex items-center justify-between p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-left"
          >
            <span className={formData.adults === "0" ? "text-green-400" : "text-gray-300"}>
              {formData.adults === "0" ? "Select Adults" : `${formData.adults} Adults`}
            </span>
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showAdultsDropdown && (
            <div className="absolute top-full left-0 right-0 z-10 bg-gray-700 border border-gray-600 rounded-md shadow-lg mt-1">
              {[0,1,2,3,4,5,6,7,8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    handleInputChange('adults', num.toString());
                    setShowAdultsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-600 focus:outline-none focus:bg-gray-600 text-white"
                >
                  {num} Adult{num > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={childrenDropdownRef}>
        <label className="block text-sm font-medium text-gray-400 mb-2">NO. OF CHILDREN</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowChildrenDropdown(!showChildrenDropdown)}
            className="w-full flex items-center justify-between p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-left"
          >
            <span className="text-gray-300">
              {formData.children === "0" ? "00" : `${formData.children} Child${formData.children !== "1" ? 'ren' : ''}`}
            </span>
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showChildrenDropdown && (
            <div className="absolute top-full left-0 right-0 z-10 bg-gray-700 border border-gray-600 rounded-md shadow-lg mt-1">
              {[0,1,2,3,4,5,6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    handleInputChange('children', num.toString());
                    setShowChildrenDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-600 focus:outline-none focus:bg-gray-600 text-white"
                >
                  {num === 0 ? "No Children" : `${num} Child${num > 1 ? 'ren' : ''}`}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.children && <p className="text-red-400 text-sm mt-1">{errors.children}</p>}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">SPECIAL REQUEST</label>
      <textarea
        rows={4}
        value={formData.specialRequest}
        onChange={(e) => handleInputChange('specialRequest', e.target.value)}
        className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
        placeholder="Any special requests or requirements..."
      ></textarea>
    </div>

    <div className="pt-4 border-t border-gray-600">
      <button
        type="submit"
        disabled={isSubmitting || childrenError !== ""}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          isSubmitting || childrenError !== ""
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        } transition`}
      >
        {isSubmitting ? 'Processing...' : `Book Now - ${formData.total} `}
      </button>
    </div>
  </form>
</section>

            {/* Mobile versions of sidebar content */}
           <div className="lg:hidden space-y-6">
  <section className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4 text-white">Booking Details</h2>
    <div className="flex items-start space-x-4">
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        {beach && (
          <img src={getImageUrl(beach)} alt={beach.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">{beach?.name}</h3>
        <p className="text-sm text-gray-400 uppercase">{beach?.location}</p>
        <button className="mt-2 text-sm text-gray-300 border border-gray-600 rounded-full px-4 py-1 hover:bg-gray-700">
          CHANGE
        </button>
        <div className="mt-4 flex items-center">
          <div className="flex text-yellow-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" /></svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" /></svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" /></svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" /></svg>
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.691-.921 1.99 0l1.248 3.824a1 1 0 00.95.691h4.025c.969 0 1.371 1.24.588 1.81l-3.25 2.359a1 1 0 00-.364 1.118l1.248 3.824c.3.921-.755 1.688-1.54 1.118l-3.25-2.359a1 1 0 00-1.176 0l-3.25 2.359c-.784.57-1.84-.197-1.54-1.118l1.248-3.824a1 1 0 00-.364-1.118L2.052 9.252c-.783-.57-.381-1.81.588-1.81h4.025a1 1 0 00.95-.691l1.248-3.824z" /></svg>
          </div>
          <span className="ml-2 text-sm text-gray-400">0 REVIEWS</span>
        </div>
      </div>
    </div>
  </section>

  <section className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4 text-white">Price Information</h2>
    <div className="space-y-3">
      <div className="flex justify-between text-gray-300">
        <span>Price per Adult:</span>
        <span className="font-semibold">${adultPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-300">
        <span>Price per Child:</span>
        <span className="font-semibold">${childPrice.toFixed(2)}</span>
      </div>
      {numAdults > 0 && (
        <div className="flex justify-between bg-gray-700 p-2 rounded">
          <span className="text-gray-300">Adults ({numAdults}):</span>
          <span className="font-semibold text-gray-300">${adultSubtotal.toFixed(2)}</span>
        </div>
      )}
      {numChildren > 0 && (
        <div className="flex justify-between bg-gray-700 p-2 rounded">
          <span className="text-gray-300">Children ({numChildren}):</span>
          <span className="font-semibold text-gray-300">${childSubtotal.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-gray-600 pt-2 text-gray-300">
        <span>Subtotal:</span>
        <span className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-300">
        <span>Tax (10%):</span>
        <span className="font-semibold">${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between border-t border-gray-600 pt-2 font-bold text-lg text-green-400">
        <span>Total:</span>
        <span>${formData.total}</span>
      </div>
    </div>
  </section>

  <section className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4 text-white">Cancellation Policy</h2>
    <div className="space-y-2 text-sm text-gray-300">
      <div className="flex justify-between">
        <span>Can I Cancel:</span>
        <span className="text-green-400 font-bold">YES</span>
      </div>
      <div className="flex justify-between">
        <span>Cost to Cancel:</span>
        <span className="text-green-400 font-bold">${(parseFloat(formData.total) * 0.1).toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Cancel for Free Till:</span>
        <span className="text-green-400 font-bold">24 Hours Before</span>
      </div>
    </div>
  </section>

  {/* Mobile Weather & Tides Section */}
  <section className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4 text-white">Weather & Tides</h2>

    {/* Weather Information */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-300">Weather Forecast</h3>
      {!formData.preferredDate ? (
        <div className="bg-blue-900 p-4 rounded-lg">
          <p className="text-blue-300 text-sm">Select a preferred date to see weather forecast</p>
        </div>
      ) : weatherLoading ? (
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <p className="text-gray-400 text-sm">Loading weather data...</p>
          </div>
        </div>
      ) : weatherData ? (
        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <WeatherIcon condition={weatherData.condition} />
              <div>
                <p className="text-2xl font-bold text-white">{weatherData.temperature}°C</p>
                <p className="text-sm text-gray-400 capitalize">{weatherData.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {new Date(formData.preferredDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A7,7 0 0,1 19,9C19,10.38 18.5,11.65 17.65,12.65L12,22L6.35,12.65C5.5,11.65 5,10.38 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,9.64 7.2,10.25 7.56,10.75L12,18.1L16.44,10.75C16.8,10.25 17,9.64 17,9A5,5 0 0,0 12,4Z"/>
              </svg>
              <span className="text-gray-400">Humidity: {weatherData.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,13A1,1 0 0,0 19,14H5A3,3 0 0,1 2,11A3,3 0 0,1 5,8H6A1,1 0 0,0 7,7A1,1 0 0,0 6,6H5A5,5 0 0,0 0,11A5,5 0 0,0 5,16H19A3,3 0 0,1 22,19A3,3 0 0,1 19,22H17A1,1 0 0,1 16,21A1,1 0 0,1 17,20H19A1,1 0 0,0 20,19A1,1 0 0,0 19,18H5A3,3 0 0,0 2,15A3,3 0 0,0 5,12H19Z"/>
              </svg>
              <span className="text-gray-400">Wind: {weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-900 p-4 rounded-lg">
          <p className="text-red-300 text-sm">Unable to load weather data</p>
        </div>
      )}
    </div>

    {/* Tide Information */}
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-300">Tide Times</h3>
      {!formData.preferredDate ? (
        <div className="bg-blue-900 p-4 rounded-lg">
          <p className="text-blue-300 text-sm">Select a preferred date to see tide information</p>
        </div>
      ) : tideLoading ? (
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <p className="text-gray-400 text-sm">Loading tide data...</p>
          </div>
        </div>
      ) : tideData ? (
        <div className="bg-gradient-to-r from-teal-900 to-blue-900 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A7,7 0 0,1 19,9H17A5,5 0 0,0 12,4A5,5 0 0,0 7,9H5A7,7 0 0,1 12,2M5,9H19A3,3 0 0,1 22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A3,3 0 0,1 5,9Z"/>
                </svg>
                <span className="font-medium text-gray-300">High Tide</span>
              </div>
              <span className="font-bold text-blue-400">{tideData.highTide}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5,9A3,3 0 0,1 8,6H16A3,3 0 0,1 19,9V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V9M7,9V20H17V9A1,1 0 0,0 16,8H8A1,1 0 0,0 7,9Z"/>
                </svg>
                <span className="font-medium text-gray-300">Low Tide</span>
            </div>
            <span className="font-bold text-orange-400">{tideData.lowTide}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A7,7 0 0,1 19,9H17A5,5 0 0,0 12,4A5,5 0 0,0 7,9H5A7,7 0 0,1 12,2M5,9H19A3,3 0 0,1 22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A3,3 0 0,1 5,9Z"/>
              </svg>
              <span className="text-xs text-gray-400">Next High</span>
            </div>
            <span className="text-sm font-semibold text-blue-400">{tideData.nextHigh}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5,9A3,3 0 0,1 8,6H16A3,3 0 0,1 19,9V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V9M7,9V20H17V9A1,1 0 0,0 16,8H8A1,1 0 0,0 7,9Z"/>
              </svg>
              <span className="text-xs text-gray-400">Next Low</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">{tideData.nextLow}</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400 text-center">
          Times are in local timezone for {beach.location}
        </div>
      </div>
    ) : (
      <div className="bg-red-900 p-4 rounded-lg">
        <p className="text-red-300 text-sm">Unable to load tide data</p>
      </div>
    )}
  </div>
  </section>

  {/* Mobile Map Section */}
  <section className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4 text-white">Location Map</h2>
    {mapError ? (
      <div className="bg-red-900 p-4 rounded-lg">
        <p className="text-red-300 text-sm">{mapError}</p>
        <button
          onClick={initializeMap}
          className="mt-2 text-sm text-red-400 hover:text-red-200 underline"
        >
          Try to reload map
        </button>
      </div>
    ) : (
      <div
        ref={mapRef}
        className="w-full h-48 rounded-lg border border-gray-600"
        style={{ minHeight: '192px' }}
      >
        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    )}
    <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
      <span>{beach.location}</span>
      <button
        onClick={() => window.open(`https://maps.google.com/?q=${beachCoords.lat},${beachCoords.lng}`, '_blank')}
        className="text-blue-400 hover:text-blue-200 underline"
      >
        Open in Google Maps
      </button>
    </div>
  </section>
</div>
<section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-white">Payment Policy</h2>
  <ul className="list-disc list-inside space-y-2 mt-4 text-gray-300">
    <li>The amount stated on your booking will be charged from your payment method.</li>
    <li>Payment processing is handled on a secured server that encrypts your credit card information.</li>
    <li>Payment should reflect on your statement bearing the name "Travelafric.com."</li>
    <li>
      By clicking "Book Now" or "Add to Cart," you agree you have read and accept our{" "}
      <a href="#" className="text-green-400 font-bold hover:underline">Terms and Conditions</a> and{" "}
      <a href="#" className="text-green-400 font-bold hover:underline">Privacy Policy</a>.
    </li>
  </ul>
</section>

<section className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-white">Cancellation Policy</h2>
  <ul className="list-disc list-inside space-y-2 mt-4 text-gray-300">
    <li>Unless otherwise specifically stated per the services being booked for, you can cancel for free **24 hours before** the start of your booked service.</li>
    <li>If you change or cancel your booking within **24 hours before** your booked service date (UCT), a cancellation penalty will apply (including tax).</li>
    <li>The cancellation penalty will be stated on your booking voucher.</li>
    <li>A minimum of **10%** will be charged for no-shows.</li>
  </ul>
</section>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BeachBooking;
