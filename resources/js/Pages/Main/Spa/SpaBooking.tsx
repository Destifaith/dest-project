"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { router, usePage } from '@inertiajs/react';
import MainLayout from "@/Pages/Layouts/MainLayout";
import { PageProps } from "@/types";

// Define types for the spa prop
interface SpaProps {
  spa: {
    id: number;
    name: string;
    location: string;
    description?: string;
    treatment_type?: string;
    ambiance_type?: string;
    price: string;
    main_image?: string;
    latitude?: number;
    longitude?: number;
    facilities?: string[];
    opening_hours?: Record<string, any>;
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    status: string;
  } | null;
}

// Define types for form data
type SpaBookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  healthConditions: string;
  wellnessGoals: string;
  bookingType: 'treatment' | 'package' | 'day_pass';
  treatmentType: string;
  durationHours: number;
  numberOfGuests: number;
  preferredDate: string;
  preferredTime: string;
  paymentMethod: string;
  specialRequirements: string;
  aromatherapyPreference: string;
  therapistGenderPreference: string;
};

// Pricing types
type SpaPricing = {
  type: 'treatment' | 'package' | 'day_pass';
  basePrice: number;
  treatmentPrice?: number;
  packagePrice?: number;
  dayPassPrice?: number;
  duration?: number;
  guests?: number;
  subtotal?: number;
  tax: number;
  serviceCharge: number;
  total: number;
  description: string;
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

// Time slots for spa (more relaxed hours)
const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

// Payment methods
const paymentMethods = [
  "Credit Card",
  "Debit Card",
  "Mobile Money",
  "Bank Transfer",
  "Cash on Arrival"
];

// Wellness goals
const wellnessGoals = [
  "Stress Relief",
  "Pain Management",
  "Detoxification",
  "Skin Rejuvenation",
  "Muscle Recovery",
  "Improved Sleep",
  "Energy Boost",
  "General Relaxation",
  "Other"
];

// Treatment types
const treatmentTypes = [
  "Swedish Massage",
  "Deep Tissue Massage",
  "Aromatherapy",
  "Hot Stone Massage",
  "Thai Massage",
  "Reflexology",
  "Facial Treatment",
  "Body Scrub",
  "Body Wrap",
  "Couples Massage"
];

// Aromatherapy preferences
const aromatherapyOptions = [
  "Lavender (Calming)",
  "Eucalyptus (Energizing)",
  "Chamomile (Relaxing)",
  "Peppermint (Invigorating)",
  "Rosemary (Focus)",
  "No Preference",
  "None"
];

// Therapist gender preferences
const therapistGenderOptions = [
  "No Preference",
  "Female Therapist",
  "Male Therapist"
];

// Allow undefined values in FormErrors
type FormErrors = {
  [key: string]: string | undefined;
};

// Image URL helper function
const getImageUrl = (imagePath: string | undefined | null, fallback: string = "/storage/default-spa.jpg"): string => {
  if (!imagePath) return fallback;

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  return `/storage/${imagePath}`;
};

const SpaBooking = () => {
  const { spa: backendSpa } = usePage<PageProps & { spa: SpaProps['spa'] }>().props;

  useEffect(() => {
    console.log('SpaBooking: Backend Props:', { backendSpa });
  }, [backendSpa]);

  const spa = backendSpa;

  useEffect(() => {
    console.log('SpaBooking: Processed Spa:', { spa });
  }, [spa]);

  const [formData, setFormData] = useState<SpaBookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    healthConditions: "",
    wellnessGoals: "",
    bookingType: 'treatment',
    treatmentType: "",
    durationHours: 1,
    numberOfGuests: 1,
    preferredDate: "",
    preferredTime: "",
    paymentMethod: "Credit Card",
    specialRequirements: "",
    aromatherapyPreference: "No Preference",
    therapistGenderPreference: "No Preference"
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showGoalsDropdown, setShowGoalsDropdown] = useState(false);
  const [showTreatmentDropdown, setShowTreatmentDropdown] = useState(false);
  const [showAromatherapyDropdown, setShowAromatherapyDropdown] = useState(false);
  const [showTherapistDropdown, setShowTherapistDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const goalsDropdownRef = useRef<HTMLDivElement>(null);
  const treatmentDropdownRef = useRef<HTMLDivElement>(null);
  const aromatherapyDropdownRef = useRef<HTMLDivElement>(null);
  const therapistDropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  // Calculate pricing based on spa price and booking options
  const calculatePricing = useMemo((): SpaPricing | null => {
    if (!spa?.price) return null;

    // Extract numeric price from string
    const basePrice = parseFloat(spa.price.replace(/[^\d.]/g, '')) || 0;

    if (formData.bookingType === 'treatment') {
      // Treatment: base price per hour
      const treatmentPrice = basePrice * formData.durationHours;
      const tax = treatmentPrice * 0.1; // 10% tax
      const serviceCharge = treatmentPrice * 0.08; // 8% service charge for spa
      const total = treatmentPrice + tax + serviceCharge;

      return {
        type: 'treatment',
        basePrice: basePrice,
        treatmentPrice: treatmentPrice,
        duration: formData.durationHours,
        tax: tax,
        serviceCharge: serviceCharge,
        total: total,
        description: `${formData.treatmentType || 'Treatment'} - ${formData.durationHours} hour${formData.durationHours > 1 ? 's' : ''}`
      };
    } else if (formData.bookingType === 'package') {
      // Package: 15% discount on base price
      const packagePrice = basePrice * 0.85 * formData.numberOfGuests;
      const tax = packagePrice * 0.1;
      const serviceCharge = packagePrice * 0.08;
      const total = packagePrice + tax + serviceCharge;

      return {
        type: 'package',
        basePrice: basePrice,
        packagePrice: packagePrice,
        guests: formData.numberOfGuests,
        tax: tax,
        serviceCharge: serviceCharge,
        total: total,
        description: `Wellness Package (15% off) - ${formData.numberOfGuests} guest${formData.numberOfGuests > 1 ? 's' : ''}`
      };
    } else {
      // Day pass: 20% of base price
      const dayPassPrice = basePrice * 0.2 * formData.numberOfGuests;
      const tax = dayPassPrice * 0.1;
      const serviceCharge = dayPassPrice * 0.08;
      const total = dayPassPrice + tax + serviceCharge;

      return {
        type: 'day_pass',
        basePrice: basePrice,
        dayPassPrice: dayPassPrice,
        guests: formData.numberOfGuests,
        tax: tax,
        serviceCharge: serviceCharge,
        total: total,
        description: `Day Pass - ${formData.numberOfGuests} guest${formData.numberOfGuests > 1 ? 's' : ''}`
      };
    }
  }, [spa?.price, formData.bookingType, formData.durationHours, formData.numberOfGuests, formData.treatmentType]);

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
  const handleInputChange = (field: keyof SpaBookingFormData, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));

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
    } else if (field === 'emergencyPhone' && value && !validatePhone(value, selectedCountry.phoneCode)) {
      setErrors(prev => ({
        ...prev,
        emergencyPhone: `Please enter a valid phone number for ${selectedCountry.name}`
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Personal Information
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone, selectedCountry.phoneCode)) {
      newErrors.phone = `Please enter a valid phone number for ${selectedCountry.name}`;
    }
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    // Emergency Contact
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = "Emergency contact name is required";
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = "Emergency contact phone is required";
    else if (!validatePhone(formData.emergencyPhone, selectedCountry.phoneCode)) {
      newErrors.emergencyPhone = `Please enter a valid phone number for ${selectedCountry.name}`;
    }

    // Spa Booking Details
    if (!formData.preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (!formData.preferredTime) newErrors.preferredTime = "Preferred time is required";
    if (!formData.wellnessGoals) newErrors.wellnessGoals = "Wellness goals are required";

    // Treatment specific validations
    if (formData.bookingType === 'treatment' && !formData.treatmentType) {
      newErrors.treatmentType = "Treatment type is required";
    }
    if (formData.bookingType === 'treatment' && formData.durationHours < 1) {
      newErrors.durationHours = "Duration must be at least 1 hour";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm() || !spa || !calculatePricing) {
    console.log('handleSubmit: Validation failed or no spa/pricing data');
    return;
  }

  setIsSubmitting(true);
  try {
    const bookingData = {
      type: 'spa_booking',

      // Spa information
      spa_id: spa.id,
      spa_name: spa.name,
      spa_location: spa.location,
      spa_image: getImageUrl(spa.main_image),
      spa_type: spa.treatment_type,
      ambiance_type: spa.ambiance_type,

      // Booking details
      booking_type: formData.bookingType,
      treatment_type: formData.treatmentType,
      duration_hours: formData.durationHours,
      number_of_guests: formData.numberOfGuests,

      // Preferences
      aromatherapy_preference: formData.aromatherapyPreference,
      therapist_gender_preference: formData.therapistGenderPreference,

      // ✅ ADD THESE REQUIRED PRICING FIELDS:
      base_price: calculatePricing.basePrice,
      final_price: calculatePricing.total,
      subtotal: calculatePricing.subtotal || calculatePricing.total,
      tax: calculatePricing.tax,
      service_charge: calculatePricing.serviceCharge,
      total: calculatePricing.total,
      pricing_breakdown: calculatePricing,

      // Personal information
      customer_first_name: formData.firstName,
      customer_last_name: formData.lastName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_country: formData.country,
      customer_city: formData.city,
      address: formData.address,

      // Emergency contact
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,

      // Health and wellness
      health_conditions: formData.healthConditions,
      wellness_goals: formData.wellnessGoals,

      // Schedule
      preferred_date: formData.preferredDate,
      preferred_time: formData.preferredTime,
      payment_method: formData.paymentMethod,

      // Optional fields
      special_requirements: formData.specialRequirements
    };

    console.log('🔄 Submitting spa booking data:', bookingData);

    await router.post('/cart', bookingData, {
      onSuccess: () => {
        console.log('✅ Successfully added spa booking to cart');
        router.visit('/cart');
      },
      onError: (errors: Record<string, string>) => {
        console.error('❌ Failed to add spa booking to cart:', errors);
        alert('Failed to add spa booking to cart. Please try again.');
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
        countryDropdownRef, timeDropdownRef, paymentDropdownRef,
        goalsDropdownRef, treatmentDropdownRef, aromatherapyDropdownRef,
        therapistDropdownRef
      ];
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          if (ref === countryDropdownRef) setShowCountryDropdown(false);
          if (ref === timeDropdownRef) setShowTimeDropdown(false);
          if (ref === paymentDropdownRef) setShowPaymentDropdown(false);
          if (ref === goalsDropdownRef) setShowGoalsDropdown(false);
          if (ref === treatmentDropdownRef) setShowTreatmentDropdown(false);
          if (ref === aromatherapyDropdownRef) setShowAromatherapyDropdown(false);
          if (ref === therapistDropdownRef) setShowTherapistDropdown(false);
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!spa) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-green-50 to-rose-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-600">Unable to load spa information. Please try again later or contact support.</p>
              <button
                onClick={() => router.visit('/spa')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Back to Spas
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-green-50 to-rose-50 min-h-screen py-8">
        <div className="container mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-6 px-4">
          {/* Sidebar - Left Column */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 lg:order-1">
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
              <h2 className="text-xl font-light mb-4 text-gray-800">{spa.name}</h2>
              <div className="flex flex-col items-center">
                <div className="w-full h-48 rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(spa.main_image)}
                    alt={spa.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/storage/default-spa.jpg";
                    }}
                  />
                </div>
                <div className="w-full mt-4 text-center">
                  <p className="text-sm text-gray-600 uppercase">{spa.location}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {spa.treatment_type || 'Wellness Spa'} • {spa.ambiance_type || 'Serene Ambiance'}
                  </p>
                  <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    ✨ Premium Wellness Services
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Summary */}
            {calculatePricing && (
              <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
                <h2 className="text-xl font-light mb-4 text-gray-800">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Booking Type:</span>
                    <span className="font-semibold text-sm text-right capitalize">
                      {formData.bookingType.replace('_', ' ')}
                    </span>
                  </div>

                  {formData.bookingType === 'treatment' ? (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Treatment:</span>
                        <span className="font-semibold text-sm">{formData.treatmentType}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Duration:</span>
                        <span className="font-semibold">{formData.durationHours} hour{formData.durationHours > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Hourly Rate:</span>
                        <span className="font-semibold">${calculatePricing.basePrice.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Guests:</span>
                        <span className="font-semibold">{formData.numberOfGuests}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Base Price:</span>
                        <span className="font-semibold">${calculatePricing.basePrice.toFixed(2)}</span>
                      </div>
                      {formData.bookingType === 'package' && (
                        <div className="flex justify-between text-green-600">
                          <span>Package Discount:</span>
                          <span className="font-semibold">15% off</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between bg-green-50 p-2 rounded text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ${(calculatePricing.subtotal || calculatePricing.total).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%):</span>
                    <span className="font-semibold">${calculatePricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service Charge (8%):</span>
                    <span className="font-semibold">${calculatePricing.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2 font-bold text-lg text-green-700">
                    <span>Total:</span>
                    <span>${calculatePricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}

            <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
              <h2 className="text-xl font-light mb-4 text-gray-800">Cancellation Policy</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Can I Cancel:</span>
                  <span className="text-green-600 font-semibold">YES</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost to Cancel:</span>
                  <span className="text-green-600 font-semibold">
                    ${calculatePricing ? (calculatePricing.total * 0.15).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cancel for Free Till:</span>
                  <span className="text-green-600 font-semibold">24 Hours Before</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
              <h2 className="text-xl font-light text-gray-800 mb-4">Wellness Benefits</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✨</span>
                  Professional certified therapists
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">🌿</span>
                  Natural and organic products
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">💆</span>
                  Personalized treatment plans
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">🕯️</span>
                  Serene and calming environment
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">🎵</span>
                  Soothing music and aromatherapy
                </li>
              </ul>
            </section>

            {spa.contact_phone || spa.contact_email ? (
              <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
                <h2 className="text-xl font-light mb-4 text-gray-800">Contact Information</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  {spa.contact_phone && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">📞</span>
                      <span>{spa.contact_phone}</span>
                    </div>
                  )}
                  {spa.contact_email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✉️</span>
                      <span>{spa.contact_email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">📍</span>
                    <span>{spa.location}</span>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          {/* Main Content Area - Right Column */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
              <h2 className="text-2xl font-light text-gray-800 mb-6">Spa Wellness Booking</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-light text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <div className="flex">
                        <div className="relative flex-shrink-0" ref={countryDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center px-3 py-2 bg-green-200 border border-r-0 border-green-300 rounded-l-md text-gray-800"
                          >
                            <span className="mr-2">{selectedCountry.flag}</span>
                            <span>{selectedCountry.phoneCode}</span>
                          </button>
                          {showCountryDropdown && (
                            <div className="absolute z-10 w-48 mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {countries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setShowCountryDropdown(false);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50"
                                >
                                  <span className="mr-3">{country.flag}</span>
                                  <span className="flex-1 text-left">{country.name}</span>
                                  <span className="text-gray-500">{country.phoneCode}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-r-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your country"
                      />
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your city"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your full address"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-light text-gray-800 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Full name of emergency contact"
                      />
                      {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Emergency contact phone"
                      />
                      {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Spa Booking Type */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-light text-gray-800 mb-4">Spa Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Booking Option *</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bookingType"
                            value="treatment"
                            checked={formData.bookingType === 'treatment'}
                            onChange={(e) => handleInputChange('bookingType', e.target.value)}
                            className="mr-2 text-green-600"
                          />
                          <span className="text-gray-800">Individual Treatment</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bookingType"
                            value="package"
                            checked={formData.bookingType === 'package'}
                            onChange={(e) => handleInputChange('bookingType', e.target.value)}
                            className="mr-2 text-green-600"
                          />
                          <span className="text-gray-800">Wellness Package (15% off)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bookingType"
                            value="day_pass"
                            checked={formData.bookingType === 'day_pass'}
                            onChange={(e) => handleInputChange('bookingType', e.target.value)}
                            className="mr-2 text-green-600"
                          />
                          <span className="text-gray-800">Day Pass (20% of regular)</span>
                        </label>
                      </div>
                    </div>

                    {formData.bookingType === 'treatment' && (
                      <>
                        <div className="relative" ref={treatmentDropdownRef}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Type *</label>
                          <button
                            type="button"
                            onClick={() => setShowTreatmentDropdown(!showTreatmentDropdown)}
                            className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {formData.treatmentType || "Select treatment type"}
                          </button>
                          {showTreatmentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {treatmentTypes.map((treatment) => (
                                <button
                                  key={treatment}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange('treatmentType', treatment);
                                    setShowTreatmentDropdown(false);
                                  }}
                                  className="w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50 text-left"
                                >
                                  {treatment}
                                </button>
                              ))}
                            </div>
                          )}
                          {errors.treatmentType && <p className="text-red-500 text-sm mt-1">{errors.treatmentType}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours) *</label>
                          <select
                            value={formData.durationHours}
                            onChange={(e) => handleInputChange('durationHours', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {[1, 1.5, 2, 2.5, 3].map(hours => (
                              <option key={hours} value={hours}>
                                {hours} hour{hours > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                          {errors.durationHours && <p className="text-red-500 text-sm mt-1">{errors.durationHours}</p>}
                        </div>
                      </>
                    )}

                    {(formData.bookingType === 'package' || formData.bookingType === 'day_pass') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                        <select
                          value={formData.numberOfGuests}
                          onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {[1, 2, 3, 4, 5, 6].map(guests => (
                            <option key={guests} value={guests}>
                              {guests} guest{guests > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wellness Preferences */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-light text-gray-800 mb-4">Wellness Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative" ref={goalsDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Wellness Goals *</label>
                      <button
                        type="button"
                        onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.wellnessGoals || "Select your wellness goals"}
                      </button>
                      {showGoalsDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {wellnessGoals.map((goal) => (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => {
                                handleInputChange('wellnessGoals', goal);
                                setShowGoalsDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50 text-left"
                            >
                              {goal}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.wellnessGoals && <p className="text-red-500 text-sm mt-1">{errors.wellnessGoals}</p>}
                    </div>

                    <div className="relative" ref={aromatherapyDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aromatherapy Preference</label>
                      <button
                        type="button"
                        onClick={() => setShowAromatherapyDropdown(!showAromatherapyDropdown)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.aromatherapyPreference}
                      </button>
                      {showAromatherapyDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {aromatherapyOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                handleInputChange('aromatherapyPreference', option);
                                setShowAromatherapyDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50 text-left"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={therapistDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Therapist Preference</label>
                      <button
                        type="button"
                        onClick={() => setShowTherapistDropdown(!showTherapistDropdown)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.therapistGenderPreference}
                      </button>
                      {showTherapistDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {therapistGenderOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                handleInputChange('therapistGenderPreference', option);
                                setShowTherapistDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50 text-left"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions / Allergies</label>
                      <textarea
                        value={formData.healthConditions}
                        onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Please list any health conditions, allergies, or medical concerns..."
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Payment */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-light text-gray-800 mb-4">Schedule & Payment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                      <input
                        type="date"
                        min={today}
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>}
                    </div>

                    <div className="relative" ref={timeDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                      <button
                        type="button"
                        onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.preferredTime ? formatTime(formData.preferredTime) : "Select preferred time"}
                      </button>
                      {showTimeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                handleInputChange('preferredTime', time);
                                setShowTimeDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50 text-left"
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.preferredTime && <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>}
                    </div>

                    <div className="relative" ref={paymentDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                      <button
                        type="button"
                        onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                        className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.paymentMethod}
                      </button>
                      {showPaymentDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {paymentMethods.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                handleInputChange('paymentMethod', method);
                                setShowPaymentDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-800 hover:bg-green-50 text-left"
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special requirements, preferences, or notes for our therapists..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !calculatePricing}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium text-lg ${
                    isSubmitting || !calculatePricing
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  {isSubmitting ? 'Processing...' : `Book Wellness Experience - $${calculatePricing?.total.toFixed(2) || '0.00'}`}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SpaBooking;
