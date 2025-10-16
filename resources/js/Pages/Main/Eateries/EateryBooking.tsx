"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { router, usePage } from '@inertiajs/react';
import MainLayout from "@/Pages/Layouts/MainLayout";
import { PageProps } from "@/types";

// Define types for the eatery prop
interface EateryMenu {
  id: number;
  menu_date: string;
  structured_menu: Record<string, Array<{ name: string; price: string }>>;
  extras?: Array<{ name: string; price: string }>;
}

interface EateryProps {
  eatery: {
    id: number;
    name: string;
    location: string;
    price_range: string;
    price: number;
    main_image?: string;
    cuisine_type?: string;
    eatery_type?: string;
    capacity?: number;
    opening_hours?: Record<string, any>;
    contact_phone?: string;
    contact_email?: string;
    is_open?: boolean;
    delivery_fee: number;
    minimum_order: number;
    daily_menus?: EateryMenu[];
    latitude?: number;
    longitude?: number;
  } | null;
}

// Define types for form data
type ReservationFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  specialRequirements: string;
  preferredDate: string;
  preferredTime: string;
  numberOfPeople: string; // ✅ Replaces adults/children
  tablePreference: string;
  occasion: string;
};

type DeliveryFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  apartment: string;
  postalCode: string;
  deliveryInstructions: string;
  preferredDate: string;
  preferredTime: string;
  paymentMethod: string;
};

// Type for flattened menu items
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

// Type for location data
type LocationData = {
  address: string;
  latitude: number;
  longitude: number;
};

// Allow undefined values in FormErrors
type FormErrors = {
  [key: string]: string | undefined;
};

// Format menu date for display
const formatMenuDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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

// Time slots
const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00"
];

// Table preferences
const tablePreferences = [
  "Any",
  "Window View",
  "Outdoor",
  "Private Booth",
  "Chef's Table",
  "Bar Seating",
  "Family Table"
];

// Occasion types
const occasions = [
  "Casual Dining",
  "Business Lunch",
  "Birthday Celebration",
  "Anniversary",
  "Date Night",
  "Family Gathering",
  "Special Occasion",
  "Other"
];

// Payment methods
const paymentMethods = [
  "Credit Card",
  "Debit Card",
  "Mobile Money",
  "Cash on Delivery",
  "Bank Transfer"
];

// Delivery pricing tiers (per km)
const DELIVERY_PRICE_TIERS = {
  base: 5,
  perKm: 2,
  freeThreshold: 50,
  maxDistance: 20
};

// Custom hook to calculate eatery status based on opening hours
const useEateryStatus = (backendEatery: EateryProps['eatery']) => {
  return useMemo(() => {
    if (!backendEatery) {
      console.log('useEateryStatus: backendEatery is null');
      return null;
    }
    const calculateIsOpen = (openingHours: Record<string, any> | undefined): boolean => {
      if (!openingHours) {
        console.log('useEateryStatus: opening_hours is undefined');
        return true;
      }
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const todayHours = openingHours[currentDay];
      if (!todayHours || !todayHours.isOpen) {
        console.log(`useEateryStatus: No hours or not open for ${currentDay}`);
        return false;
      }
      const openTime = todayHours.openTime;
      const closeTime = todayHours.closeTime;
      if (closeTime === '00:00') {
        return currentTime >= openTime;
      }
      if (closeTime < openTime) {
        return currentTime >= openTime || currentTime <= closeTime;
      }
      return currentTime >= openTime && currentTime <= closeTime;
    };
    const getNextOpeningTime = (openingHours: Record<string, any> | undefined): string => {
      if (!openingHours) {
        console.log('useEateryStatus: opening_hours is undefined for next opening time');
        return "Unknown";
      }
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let currentDayIndex = now.getDay();
      for (let i = 0; i < 7; i++) {
        const dayIndex = (currentDayIndex + i) % 7;
        const dayName = days[dayIndex];
        const hours = openingHours[dayName];
        if (hours && hours.isOpen) {
          const dayText = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName;
          const formatTime = (time: string): string => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${period}`;
          };
          return `${dayText} at ${formatTime(hours.openTime)}`;
        }
      }
      return "Unknown";
    };
    const forceOpenForTesting = true;
    const isOpen = forceOpenForTesting ? true : (backendEatery.is_open ?? calculateIsOpen(backendEatery.opening_hours));
    const nextOpeningTime = getNextOpeningTime(backendEatery.opening_hours);
    return {
      ...backendEatery,
      is_open: isOpen,
      next_opening_time: nextOpeningTime
    };
  }, [backendEatery]);
};

const EateryBooking = () => {
  const { eatery: backendEatery } = usePage<PageProps & { eatery: EateryProps['eatery'] }>().props;

  useEffect(() => {
    console.log('EateryBooking: Backend Props:', { backendEatery });
  }, [backendEatery]);

  const eatery = useEateryStatus(backendEatery);

  useEffect(() => {
    console.log('EateryBooking: Processed Eatery:', { eatery });
  }, [eatery]);

  const [activeTab, setActiveTab] = useState<'reservation' | 'delivery'>('reservation');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<LocationData | null>(null);
  const [deliveryDistance, setDeliveryDistance] = useState<number>(0);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [restaurantCoords, setRestaurantCoords] = useState<{ lat: number; lng: number } | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const addressInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Cart State for Delivery
  const [cart, setCart] = useState<{id: string, name: string, price: number, quantity: number}[]>([]);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
        console.log('Google Maps loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, []);

  // Geocode restaurant location with retry
  useEffect(() => {
    if (!googleMapsLoaded || !eatery?.location) return;

    const isGeocoderReady = (): boolean => {
      return typeof google !== 'undefined' &&
             typeof google.maps !== 'undefined' &&
             typeof google.maps.Geocoder === 'function';
    };

    const maxRetries = 10;
    let retries = 0;

    const tryGeocode = () => {
      if (isGeocoderReady()) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: eatery.location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            setRestaurantCoords({
              lat: location.lat(),
              lng: location.lng()
            });
            console.log('Restaurant coordinates:', { lat: location.lat(), lng: location.lng() });
          } else {
            console.error('Geocode failed:', status);
            setRestaurantCoords({ lat: 5.6037, lng: -0.1870 });
          }
        });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryGeocode, 100);
      } else {
        console.error('Google Maps Geocoder not available after retries');
        setRestaurantCoords({ lat: 5.6037, lng: -0.1870 });
      }
    };

    tryGeocode();
  }, [googleMapsLoaded, eatery?.location]);

  // Initialize autocomplete
  useEffect(() => {
    if (googleMapsLoaded && addressInputRef.current) {
      const autocompleteInstance = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: ['gh', 'ng', 'us', 'gb', 'ca', 'fr', 'de', 'au', 'za', 'ke'] }
      });
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry && place.geometry.location) {
          const locationData: LocationData = {
            address: place.formatted_address || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          };
          setDeliveryLocation(locationData);
          setDeliveryForm(prev => ({ ...prev, address: locationData.address }));
          if (restaurantCoords) {
            calculateDistance(
              restaurantCoords.lat,
              restaurantCoords.lng,
              locationData.latitude,
              locationData.longitude
            );
          }
        }
      });
      setAutocomplete(autocompleteInstance);
    }
  }, [googleMapsLoaded, restaurantCoords]);

  // Initialize map
  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && restaurantCoords) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: restaurantCoords,
        zoom: 14,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });

      new google.maps.Marker({
        position: restaurantCoords,
        map: mapInstance,
        title: eatery?.name || 'Restaurant',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy44NiAyIDQuNSA1LjM2IDQuNSA5LjVDNC41IDE0LjYzIDExLjExIDIxLjUgMTEuMTEgMjEuNUMxMS4xMSAyMS41IDE5LjUgMTQuNjMgMTkuNSA5LjVDMTkuNSA1LjM2IDE2LjE0IDIgMTIgMlpNMTIgMTIuNzVDMTAuMjEgMTIuNzUgOC43NSAxMS4yOSA4Ljc1IDkuNUM4Ljc1IDcuNzEgMTAuMjEgNi4yNSAxMiA2LjI1QzEzLjc5IDYuMjUgMTUuMjUgNy43MSAxNS4yNSA5LjVDMTUuMjUgMTEuMjkgMTMuNzkgMTIuNzUgMTIgMTIuNzVaIiBmaWxsPSIjMTZhODNmIi8+Cjwvc3ZnPgo=',
          scaledSize: new google.maps.Size(32, 32),
        }
      });

      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false
      });
      setMap(mapInstance);
      setDirectionsRenderer(directionsRendererInstance);
    }
  }, [googleMapsLoaded, restaurantCoords, eatery?.name]);

  // Update map with delivery route
  useEffect(() => {
    if (map && directionsRenderer && deliveryLocation && restaurantCoords) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: restaurantCoords,
        destination: { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude },
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          new google.maps.Marker({
            position: { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude },
            map: map,
            title: 'Delivery Location',
            icon: {
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDZIMTBDOC45IDYgOCA2LjkgOCA4VjE4QzggMTkuMSA4LjkgMjAgMTAgMjBIMjBDMjEuMSAyMCAyMiAxOS4xIDIyIDE4VjhDMjIgNi45IDIxLjEgNiAyMCA2Wk0xMCA0SDRDNi4yMSA0IDggMi4yMSA4IDBDOCAyLjIxIDkuNzkgNCAxMiA0QzE0LjIxIDQgMTYgMi4yMSAxNiAwQzE2IDIuMjEgMTcuNzkgNCAyMCA0SDE0QzExLjc5IDQgMTAgMi4yMSAxMCA0WiIgZmlsbD0iI2Y1OWQxZSIvPgo8L3N2Zz4K',
              scaledSize: new google.maps.Size(32, 32),
            }
          });
        } else {
          console.error('Error calculating route:', status);
        }
      });
    }
  }, [map, directionsRenderer, deliveryLocation, restaurantCoords]);

  // Calculate distance using Haversine
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    setDeliveryDistance(distance);
    return distance;
  };

  // Calculate dynamic delivery fee
  const calculateDeliveryFee = useMemo(() => {
    if (!deliveryDistance || deliveryDistance === 0) {
      return eatery?.delivery_fee || DELIVERY_PRICE_TIERS.base;
    }
    if (deliveryDistance > DELIVERY_PRICE_TIERS.maxDistance) {
      return null;
    }
    let fee = DELIVERY_PRICE_TIERS.base;
    if (deliveryDistance > 5) {
      const additionalKm = Math.ceil(deliveryDistance - 5);
      fee += additionalKm * DELIVERY_PRICE_TIERS.perKm;
    }
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (subtotal >= DELIVERY_PRICE_TIERS.freeThreshold) {
      return 0;
    }
    return fee;
  }, [deliveryDistance, cart, eatery?.delivery_fee]);

  // Reservation Form State
  const [reservationForm, setReservationForm] = useState<ReservationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    specialRequirements: "",
    preferredDate: "",
    preferredTime: "",
    numberOfPeople: "2", // ✅ single field
    tablePreference: "Any",
    occasion: "Casual Dining"
  });

  // Delivery Form State
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    apartment: "",
    postalCode: "",
    deliveryInstructions: "",
    preferredDate: "",
    preferredTime: "",
    paymentMethod: "Credit Card"
  });

  // Compute dynamic menu items (including extras)
  const dailyMenus = eatery?.daily_menus || [];
  const normalizeDate = (dateStr: string): string => {
    return dateStr.split('T')[0];
  };

  const effectiveMenuDate = useMemo(() => {
    if (deliveryForm.preferredDate) {
      return deliveryForm.preferredDate;
    }
    const today = new Date().toISOString().split('T')[0];
    const todayMenu = dailyMenus.find(m => normalizeDate(m.menu_date) === today);
    return todayMenu
      ? today
      : dailyMenus.length > 0
        ? normalizeDate(dailyMenus[0].menu_date)
        : today;
  }, [deliveryForm.preferredDate, dailyMenus]);

  const selectedMenu = dailyMenus.find(menu => normalizeDate(menu.menu_date) === effectiveMenuDate);

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];
    if (selectedMenu) {
      // Add main menu items
      Object.entries(selectedMenu.structured_menu).forEach(([section, sectionItems]) => {
        sectionItems.forEach((item, idx) => {
          const priceStr = item.price.replace(/[^0-9.]/g, '').trim();
          const price = parseFloat(priceStr) || 0;
          items.push({
            id: `${selectedMenu.id}-${section}-${idx}`,
            name: item.name,
            price,
            category: section,
          });
        });
      });
      // ✅ Add extras as a separate category
      if (selectedMenu.extras && selectedMenu.extras.length > 0) {
        selectedMenu.extras.forEach((extra, idx) => {
          const priceStr = extra.price.replace(/[^0-9.]/g, '').trim();
          const price = parseFloat(priceStr) || 0;
          items.push({
            id: `${selectedMenu.id}-extras-${idx}`,
            name: extra.name,
            price,
            category: 'Extras',
          });
        });
      }
    }
    return items;
  }, [selectedMenu, effectiveMenuDate]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPeopleDropdown, setShowPeopleDropdown] = useState(false); // ✅ for numberOfPeople
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const [showOccasionDropdown, setShowOccasionDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const peopleDropdownRef = useRef<HTMLDivElement>(null); // ✅
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const tableDropdownRef = useRef<HTMLDivElement>(null);
  const occasionDropdownRef = useRef<HTMLDivElement>(null);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Reservation pricing: flat rate per person
  const pricePerPerson = eatery?.price || 5;
  const numPeople = parseInt(reservationForm.numberOfPeople) || 0;
  const reservationSubtotal = numPeople * pricePerPerson;
  const reservationTax = reservationSubtotal > 0 ? Math.max(reservationSubtotal * 0.1, 1) : 0;
  const reservationServiceCharge = reservationSubtotal > 0 ? reservationSubtotal * 0.05 : 0;
  const reservationTotal = reservationSubtotal + reservationTax + reservationServiceCharge;

  const deliverySubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = calculateDeliveryFee !== null ? calculateDeliveryFee : (eatery?.delivery_fee || 5);
  const deliveryTax = deliverySubtotal > 0 ? Math.max(deliverySubtotal * 0.1, 1) : 0;
  const deliveryTotal = deliverySubtotal + deliveryFee + deliveryTax;

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string, countryCode: string): boolean => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (countryCode === "+233") {
      return /^\+233\d{9}$/.test(cleanPhone);
    } else if (countryCode === "+234") {
      return /^\+234\d{10}$/.test(cleanPhone);
    } else if (countryCode === "+1") {
      return /^\+1\d{10}$/.test(cleanPhone);
    } else if (countryCode === "+44") {
      return /^\+44\d{10,11}$/.test(cleanPhone);
    }
    return /^\+\d{1,4}\d{7,15}$/.test(cleanPhone);
  };

  // Form handlers
  const handleReservationInputChange = (field: keyof ReservationFormData, value: string): void => {
    setReservationForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (field === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else if (field === 'phone' && value && !validatePhone(value, selectedCountry.phoneCode)) {
      setErrors(prev => ({
        ...prev,
        phone: `Please enter a valid phone number for ${selectedCountry.name}`
      }));
    }
  };

  const handleDeliveryInputChange = (field: keyof DeliveryFormData, value: string): void => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (field === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else if (field === 'phone' && value && !validatePhone(value, selectedCountry.phoneCode)) {
      setErrors(prev => ({
        ...prev,
        phone: `Please enter a valid phone number for ${selectedCountry.name}`
      }));
    }
  };

  const validateReservationForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!reservationForm.firstName.trim()) newErrors.firstName = "First name is required";
    if (!reservationForm.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!reservationForm.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(reservationForm.email)) newErrors.email = "Please enter a valid email";
    if (!reservationForm.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!validatePhone(reservationForm.phone, selectedCountry.phoneCode)) {
      newErrors.phone = `Please enter a valid phone number for ${selectedCountry.name}`;
    }
    if (!reservationForm.country.trim()) newErrors.country = "Country is required";
    if (!reservationForm.city.trim()) newErrors.city = "City is required";
    if (!reservationForm.preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (!reservationForm.preferredTime) newErrors.preferredTime = "Preferred time is required";
    if (numPeople < 1) newErrors.numberOfPeople = "At least 1 person is required"; // ✅
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDeliveryForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!deliveryForm.firstName.trim()) newErrors.firstName = "First name is required";
    if (!deliveryForm.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!deliveryForm.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(deliveryForm.email)) newErrors.email = "Please enter a valid email";
    if (!deliveryForm.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!validatePhone(deliveryForm.phone, selectedCountry.phoneCode)) {
      newErrors.phone = `Please enter a valid phone number for ${selectedCountry.name}`;
    }
    if (!deliveryForm.country.trim()) newErrors.country = "Country is required";
    if (!deliveryForm.city.trim()) newErrors.city = "City is required";
    if (!deliveryForm.address.trim()) newErrors.address = "Delivery address is required";
    if (!deliveryForm.preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (!deliveryForm.preferredTime) newErrors.preferredTime = "Preferred time is required";
    if (cart.length === 0) newErrors.cart = "Please add at least one item to your order";
    if (deliverySubtotal < (eatery?.minimum_order || 15)) {
      newErrors.minimum = `Minimum order amount is $${eatery?.minimum_order || 15}`;
    }
    if (calculateDeliveryFee === null) {
      newErrors.distance = `Delivery not available beyond ${DELIVERY_PRICE_TIERS.maxDistance}km`;
    }
    if (!restaurantCoords) {
      newErrors.map = "Unable to load restaurant location. Please try again.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateReservationForm() || !eatery) {
    console.log('handleReservationSubmit: Validation failed or no eatery data');
    return;
  }
  setIsSubmitting(true);
  try {
    const cartItemData = {
      type: 'eatery_reservation',

      // ✅ Fixed field names to match backend (snake_case)
      eatery_id: eatery.id,
      eatery_name: eatery.name,
      eatery_location: eatery.location,
      eatery_image: eatery.main_image || "/storage/default-eatery.jpg",
      cuisine_type: eatery.cuisine_type,
      price_per_person: pricePerPerson,
      number_of_people: parseInt(reservationForm.numberOfPeople),
      preferred_date: reservationForm.preferredDate,
      preferred_time: reservationForm.preferredTime,
      table_preference: reservationForm.tablePreference,
      occasion: reservationForm.occasion,
      special_requirements: reservationForm.specialRequirements,
      subtotal: reservationSubtotal,
      tax: reservationTax,
      service_charge: reservationServiceCharge,
      total: reservationTotal,

      // ✅ Add required customer fields
      customer_first_name: reservationForm.firstName,
      customer_last_name: reservationForm.lastName,
      customer_email: reservationForm.email,
      customer_phone: reservationForm.phone,
      customer_country: reservationForm.country,
      customer_city: reservationForm.city,
      customer_address: '', // Optional but included for consistency
    };

    console.log('🔄 Sending reservation data:', cartItemData);

    await router.post('/cart', cartItemData, {
      onSuccess: () => {
        console.log('✅ Successfully added reservation to cart');
        router.visit('/cart');
      },
      onError: (errors: Record<string, string>) => {
        console.error('❌ Failed to add reservation to cart:', errors);
        alert('Failed to add reservation to cart. Please try again.');
      }
    });
  } catch (error) {
    console.error("💥 Error adding to cart:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

 const handleDeliverySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateDeliveryForm() || !eatery) {
    console.log('handleDeliverySubmit: Validation failed or no eatery data');
    return;
  }
  setIsSubmitting(true);
  try {
    const orderData = {
      type: 'eatery_delivery',

      // ✅ Fixed field names to match backend (snake_case)
      eatery_id: eatery.id,
      eatery_name: eatery.name,
      eatery_location: eatery.location,
      eatery_image: eatery.main_image || "/storage/default-eatery.jpg",
      cuisine_type: eatery.cuisine_type,
      items: cart,
      subtotal: deliverySubtotal,
      delivery_fee: deliveryFee,
      tax: deliveryTax,
      total: deliveryTotal,
      delivery_distance: deliveryDistance,
      delivery_address: deliveryForm.address,
      delivery_apartment: deliveryForm.apartment,
      delivery_postal_code: deliveryForm.postalCode,
      delivery_instructions: deliveryForm.deliveryInstructions,
      preferred_date: deliveryForm.preferredDate,
      preferred_time: deliveryForm.preferredTime,
      payment_method: deliveryForm.paymentMethod,

      // ✅ Add required customer fields
      customer_first_name: deliveryForm.firstName,
      customer_last_name: deliveryForm.lastName,
      customer_email: deliveryForm.email,
      customer_phone: deliveryForm.phone,
      customer_country: deliveryForm.country,
      customer_city: deliveryForm.city,
    };

    console.log('🔄 Sending delivery data:', orderData);

    await router.post('/cart', orderData, {
      onSuccess: () => {
        console.log('✅ Successfully added delivery to cart');
        router.visit('/cart');
      },
      onError: (errors: Record<string, string>) => {
        console.error('❌ Failed to add delivery to cart:', errors);
        alert('Failed to add delivery order to cart. Please try again.');
      }
    });
  } catch (error) {
    console.error("💥 Error adding to cart:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refs = [
        countryDropdownRef, peopleDropdownRef, // ✅
        timeDropdownRef, tableDropdownRef, occasionDropdownRef, paymentDropdownRef
      ];
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          if (ref === countryDropdownRef) setShowCountryDropdown(false);
          if (ref === peopleDropdownRef) setShowPeopleDropdown(false); // ✅
          if (ref === timeDropdownRef) setShowTimeDropdown(false);
          if (ref === tableDropdownRef) setShowTableDropdown(false);
          if (ref === occasionDropdownRef) setShowOccasionDropdown(false);
          if (ref === paymentDropdownRef) setShowPaymentDropdown(false);
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!eatery || !backendEatery) {
    return (
      <MainLayout>
        <div className="bg-gray-100 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-600">Unable to load eatery information. Please try again later or contact support.</p>
              <button
                onClick={() => router.visit('/eateries')}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Back to Eateries
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
          {/* Sidebar - Left Column */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 lg:order-1">
            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-white">{eatery.name || 'Unknown Eatery'}</h2>
              <div className="flex flex-col items-center">
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={eatery.main_image || "/storage/default-eatery.jpg"}
                    alt={eatery.name || 'Eatery'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full mt-4 text-center">
                  <p className="text-sm text-gray-400 uppercase">{eatery.location || 'Unknown Location'}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {eatery.cuisine_type || 'Unknown Cuisine'} • {eatery.eatery_type || 'Unknown Type'}
                  </p>
                  <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    eatery.is_open
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {eatery.is_open ? '🟢 Currently Open' : '🔴 Currently Closed'}
                  </div>
                </div>
              </div>
            </section>
            {activeTab === 'reservation' && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Reservation Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Price per Person:</span>
                    <span className="font-semibold">${pricePerPerson.toFixed(2)}</span>
                  </div>
                  {numPeople > 0 && (
                    <div className="flex justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300">
                      <span>People ({numPeople}):</span>
                      <span className="font-semibold">${reservationSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${reservationSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tax (10%):</span>
                    <span className="font-semibold">${reservationTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Service Charge (5%):</span>
                    <span className="font-semibold">${reservationServiceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 font-bold text-lg text-green-600 dark:text-green-400">
                    <span>Total:</span>
                    <span>${reservationTotal.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}
            {activeTab === 'delivery' && eatery.is_open && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${deliverySubtotal.toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Base Delivery Fee:</span>
                      <span className="font-semibold">${DELIVERY_PRICE_TIERS.base.toFixed(2)}</span>
                    </div>
                    {deliveryDistance > 0 && (
                      <>
                        <div className="flex justify-between text-gray-700 dark:text-gray-300 text-sm">
                          <span>Distance:</span>
                          <span>{deliveryDistance.toFixed(1)} km</span>
                        </div>
                        {deliveryDistance > 5 && (
                          <div className="flex justify-between text-gray-700 dark:text-gray-300 text-sm">
                            <span>Additional ({Math.ceil(deliveryDistance - 5)} km × ${DELIVERY_PRICE_TIERS.perKm}):</span>
                            <span>${((Math.ceil(deliveryDistance - 5)) * DELIVERY_PRICE_TIERS.perKm).toFixed(2)}</span>
                          </div>
                        )}
                        {deliverySubtotal >= DELIVERY_PRICE_TIERS.freeThreshold && (
                          <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-semibold">
                            <span>Free Delivery Applied:</span>
                            <span>-${(DELIVERY_PRICE_TIERS.base + (deliveryDistance > 5 ? (Math.ceil(deliveryDistance - 5)) * DELIVERY_PRICE_TIERS.perKm : 0)).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tax (10%):</span>
                    <span className="font-semibold">${deliveryTax.toFixed(2)}</span>
                  </div>
                  {calculateDeliveryFee === null && (
                    <div className="bg-red-100 dark:bg-red-900 p-2 rounded">
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        Delivery not available beyond {DELIVERY_PRICE_TIERS.maxDistance}km
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 font-bold text-lg text-green-600 dark:text-green-400">
                    <span>Total:</span>
                    <span>${deliveryTotal.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}
            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-white">Cancellation Policy</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Can I Cancel:</span>
                  <span className="text-green-400 font-bold">YES</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost to Cancel:</span>
                  <span className="text-green-400 font-bold">
                    ${activeTab === 'reservation'
                      ? (reservationTotal * 0.1).toFixed(2)
                      : (deliveryTotal * 0.1).toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cancel for Free Till:</span>
                  <span className="text-green-400 font-bold">24 Hours Before</span>
                </div>
              </div>
            </section>
            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-white mb-4">Payment Policy</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
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
              <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
              <div className="space-y-3 text-sm text-gray-300">
                {eatery.contact_phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span>{eatery.contact_phone}</span>
                  </div>
                )}
                {eatery.contact_email && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>{eatery.contact_email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>{eatery.location || 'Unknown Location'}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Main Content Area - Right Column */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex border-b border-gray-600">
                <button
                  onClick={() => setActiveTab('reservation')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'reservation'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🪑 Reserve a Table
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'delivery'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : eatery.is_open
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!eatery.is_open}
                >
                  {eatery.is_open
                    ? '🚚 Order Delivery'
                    : `🚚 Closed - Opens ${eatery.next_opening_time}`
                  }
                </button>
              </div>

              {activeTab === 'reservation' && (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Reserve a Table</h2>
                  <form onSubmit={handleReservationSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={reservationForm.firstName}
                          onChange={(e) => handleReservationInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={reservationForm.lastName}
                          onChange={(e) => handleReservationInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          value={reservationForm.email}
                          onChange={(e) => handleReservationInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="your@email.com"
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                        <div className="flex">
                          <div className="relative flex-shrink-0" ref={countryDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              className="flex items-center px-3 py-2 bg-gray-600 border border-r-0 border-gray-600 rounded-l-md text-white"
                            >
                              <span className="mr-2">{selectedCountry.flag}</span>
                              <span>{selectedCountry.phoneCode}</span>
                            </button>
                            {showCountryDropdown && (
                              <div className="absolute z-10 w-48 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                {countries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setShowCountryDropdown(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-600"
                                  >
                                    <span className="mr-3">{country.flag}</span>
                                    <span className="flex-1 text-left">{country.name}</span>
                                    <span className="text-gray-400">{country.phoneCode}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="tel"
                            value={reservationForm.phone}
                            onChange={(e) => handleReservationInputChange('phone', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Phone number"
                          />
                        </div>
                        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                        <input
                          type="text"
                          value={reservationForm.country}
                          onChange={(e) => handleReservationInputChange('country', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Your country"
                        />
                        {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                        <input
                          type="text"
                          value={reservationForm.city}
                          onChange={(e) => handleReservationInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Your city"
                        />
                        {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Date *</label>
                        <input
                          type="date"
                          min={today}
                          value={reservationForm.preferredDate}
                          onChange={(e) => handleReservationInputChange('preferredDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {errors.preferredDate && <p className="text-red-400 text-sm mt-1">{errors.preferredDate}</p>}
                      </div>
                      <div className="relative" ref={timeDropdownRef}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Time *</label>
                        <button
                          type="button"
                          onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {reservationForm.preferredTime ? formatTime(reservationForm.preferredTime) : "Select time"}
                        </button>
                        {showTimeDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  handleReservationInputChange('preferredTime', time);
                                  setShowTimeDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-white hover:bg-gray-600 text-left"
                              >
                                {formatTime(time)}
                              </button>
                            ))}
                          </div>
                        )}
                        {errors.preferredTime && <p className="text-red-400 text-sm mt-1">{errors.preferredTime}</p>}
                      </div>
                    </div>
                    {/* ✅ Updated: Single "Number of People" field */}
                    <div className="relative" ref={peopleDropdownRef}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of People *</label>
                      <button
                        type="button"
                        onClick={() => setShowPeopleDropdown(!showPeopleDropdown)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {reservationForm.numberOfPeople} {parseInt(reservationForm.numberOfPeople) === 1 ? 'Person' : 'People'}
                      </button>
                      {showPeopleDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                handleReservationInputChange('numberOfPeople', num.toString());
                                setShowPeopleDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-white hover:bg-gray-600 text-left"
                            >
                              {num} {num === 1 ? 'Person' : 'People'}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.numberOfPeople && <p className="text-red-400 text-sm mt-1">{errors.numberOfPeople}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative" ref={tableDropdownRef}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Table Preference</label>
                        <button
                          type="button"
                          onClick={() => setShowTableDropdown(!showTableDropdown)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {reservationForm.tablePreference}
                        </button>
                        {showTableDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                            {tablePreferences.map((pref) => (
                              <button
                                key={pref}
                                type="button"
                                onClick={() => {
                                  handleReservationInputChange('tablePreference', pref);
                                  setShowTableDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-white hover:bg-gray-600 text-left"
                              >
                                {pref}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={occasionDropdownRef}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Occasion</label>
                        <button
                          type="button"
                          onClick={() => setShowOccasionDropdown(!showOccasionDropdown)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {reservationForm.occasion}
                        </button>
                        {showOccasionDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                            {occasions.map((occasion) => (
                              <button
                                key={occasion}
                                type="button"
                                onClick={() => {
                                  handleReservationInputChange('occasion', occasion);
                                  setShowOccasionDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-white hover:bg-gray-600 text-left"
                              >
                                {occasion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements</label>
                      <textarea
                        value={reservationForm.specialRequirements}
                        onChange={(e) => handleReservationInputChange('specialRequirements', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Any dietary restrictions, allergies, or special requests..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                        isSubmitting
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      } transition`}
                    >
                      {isSubmitting ? 'Processing...' : `Reserve Table - $${reservationTotal.toFixed(2)}`}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'delivery' && eatery.is_open && (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Order Food Delivery</h2>
                  <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-green-300 font-medium">We're currently open for delivery!</span>
                    </div>
                    <p className="text-green-200 text-sm mt-1">
                      Orders placed now will be delivered during our current operating hours.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Menu for {formatMenuDate(effectiveMenuDate)}
                      </h3>
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-white mb-3">Delivery Area Map</h4>
                        {!restaurantCoords ? (
                          <div className="w-full h-64 rounded-lg border border-gray-600 bg-gray-700 flex items-center justify-center">
                            <div className="text-gray-400">
                              Loading restaurant location...
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              ref={mapRef}
                              className="w-full h-64 rounded-lg border border-gray-600 bg-gray-700"
                            >
                              {!googleMapsLoaded && (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  Loading map...
                                </div>
                              )}
                            </div>
                            {deliveryDistance > 0 && (
                              <div className="mt-2 text-sm text-gray-300">
                                <p>Distance: <span className="font-semibold">{deliveryDistance.toFixed(1)} km</span></p>
                                <p>Delivery Fee:
                                  <span className="font-semibold text-green-400 ml-1">
                                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                                  </span>
                                </p>
                                {deliveryDistance > DELIVERY_PRICE_TIERS.maxDistance && (
                                  <p className="text-red-400 font-semibold">
                                    Delivery not available beyond {DELIVERY_PRICE_TIERS.maxDistance}km
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        {errors.map && <p className="text-red-400 text-sm mt-1">{errors.map}</p>}
                      </div>
                      {dailyMenus.length === 0 ? (
                        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                          <p className="text-yellow-300">No menus available for this eatery. Please contact the restaurant or try another date.</p>
                        </div>
                      ) : menuItems.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {menuItems.map((item) => (
                            <div key={item.id} className="bg-gray-700 p-4 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-white">{item.name}</h4>
                                  <p className="text-sm text-gray-400">{item.category}</p>
                                  <p className="text-green-400 font-semibold">${item.price.toFixed(2)}</p>
                                </div>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                          <p className="text-yellow-300">No menu available for {formatMenuDate(effectiveMenuDate)}. Please select another date or contact the eatery.</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="bg-gray-700 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-white mb-3">Your Order</h3>
                        {cart.length === 0 ? (
                          <p className="text-gray-400 text-sm">Your cart is empty</p>
                        ) : (
                          <div className="space-y-3">
                            {cart.map((item) => (
                              <div key={item.id} className="flex justify-between items-center">
                                <div>
                                  <p className="text-white text-sm">{item.name}</p>
                                  <p className="text-gray-400 text-xs">${item.price.toFixed(2)} × {item.quantity}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 bg-gray-600 rounded-full text-white flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 bg-gray-600 rounded-full text-white flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-400 hover:text-red-300 ml-2"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                            {errors.cart && <p className="text-red-400 text-sm">{errors.cart}</p>}
                            {errors.minimum && <p className="text-red-400 text-sm">{errors.minimum}</p>}
                            {errors.distance && <p className="text-red-400 text-sm">{errors.distance}</p>}
                          </div>
                        )}
                      </div>
                      <form onSubmit={handleDeliverySubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                            <input
                              type="text"
                              value={deliveryForm.firstName}
                              onChange={(e) => handleDeliveryInputChange('firstName', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter your first name"
                            />
                            {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                            <input
                              type="text"
                              value={deliveryForm.lastName}
                              onChange={(e) => handleDeliveryInputChange('lastName', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter your last name"
                            />
                            {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                            <input
                              type="email"
                              value={deliveryForm.email}
                              onChange={(e) => handleDeliveryInputChange('email', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="your@email.com"
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                            <input
                              type="tel"
                              value={deliveryForm.phone}
                              onChange={(e) => handleDeliveryInputChange('phone', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Phone number"
                            />
                            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Address *</label>
                          <input
                            ref={addressInputRef}
                            type="text"
                            value={deliveryForm.address}
                            onChange={(e) => handleDeliveryInputChange('address', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Start typing your address..."
                          />
                          {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                          <p className="text-gray-400 text-xs mt-1">
                            Start typing your address and select from the suggestions
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Apartment/Suite</label>
                            <input
                              type="text"
                              value={deliveryForm.apartment}
                              onChange={(e) => handleDeliveryInputChange('apartment', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Apt 123"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code</label>
                            <input
                              type="text"
                              value={deliveryForm.postalCode}
                              onChange={(e) => handleDeliveryInputChange('postalCode', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Postal code"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Date *</label>
                            <input
                              type="date"
                              min={today}
                              value={deliveryForm.preferredDate}
                              onChange={(e) => handleDeliveryInputChange('preferredDate', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {errors.preferredDate && <p className="text-red-400 text-sm mt-1">{errors.preferredDate}</p>}
                          </div>
                          <div className="relative" ref={timeDropdownRef}>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Time *</label>
                            <button
                              type="button"
                              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              {deliveryForm.preferredTime ? formatTime(deliveryForm.preferredTime) : "Select time"}
                            </button>
                            {showTimeDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                {timeSlots.map((time) => (
                                  <button
                                    key={time}
                                    type="button"
                                    onClick={() => {
                                      handleDeliveryInputChange('preferredTime', time);
                                      setShowTimeDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-sm text-white hover:bg-gray-600 text-left"
                                  >
                                    {formatTime(time)}
                                  </button>
                                ))}
                              </div>
                            )}
                            {errors.preferredTime && <p className="text-red-400 text-sm mt-1">{errors.preferredTime}</p>}
                          </div>
                        </div>
                        <div className="relative" ref={paymentDropdownRef}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method *</label>
                          <button
                            type="button"
                            onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {deliveryForm.paymentMethod}
                          </button>
                          {showPaymentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                              {paymentMethods.map((method) => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => {
                                    handleDeliveryInputChange('paymentMethod', method);
                                    setShowPaymentDropdown(false);
                                  }}
                                  className="w-full px-4 py-2 text-sm text-white hover:bg-gray-600 text-left"
                                >
                                  {method}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Instructions</label>
                          <textarea
                            value={deliveryForm.deliveryInstructions}
                            onChange={(e) => handleDeliveryInputChange('deliveryInstructions', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Gate code, building instructions, etc."
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || cart.length === 0 || calculateDeliveryFee === null || !restaurantCoords}
                          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                            isSubmitting || cart.length === 0 || calculateDeliveryFee === null || !restaurantCoords
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          } transition`}
                        >
                          {isSubmitting ? 'Processing...' : `Place Order - $${deliveryTotal.toFixed(2)}`}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'delivery' && !eatery.is_open && (
                <div className="mt-6 text-center py-12">
                  <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <h3 className="text-xl font-bold text-red-300 mb-2">Currently Closed</h3>
                    <p className="text-red-200 mb-4">
                      We're not currently taking delivery orders. Please check back during our operating hours.
                    </p>
                    <p className="text-green-300 font-semibold">
                      Next opening: {eatery.next_opening_time}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EateryBooking;
