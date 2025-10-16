"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { router, usePage } from '@inertiajs/react';
import MainLayout from "@/Pages/Layouts/MainLayout";
import { PageProps } from "@/types";

// Define types for the gym prop
interface GymProps {
  gym: {
    id: number;
    name: string;
    location: string;
    description?: string;
    gym_type?: string;
    equipment_type?: string;
    price: string;
    main_image?: string;
    latitude?: number;
    longitude?: number;
    facilities?: string[];
    opening_hours?: Record<string, any>;
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    is_active: boolean;
  } | null;
}

// Define types for form data
type MembershipFormData = {
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
  fitnessGoals: string;
  membershipType: 'visit' | 'membership';
  durationMonths: number;
  familyPack: boolean;
  preferredStartDate: string;
  preferredTime: string;
  paymentMethod: string;
  specialRequirements: string;
};

// Pricing types
type Pricing = {
  type: 'single_visit' | 'membership';
  basePrice: number;
  visitPrice?: number;
  monthlyPrice?: number;
  duration?: number;
  familyPack?: boolean;
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

// Time slots
const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

// Payment methods
const paymentMethods = [
  "Credit Card",
  "Debit Card",
  "Mobile Money",
  "Bank Transfer",
  "Cash on Arrival"
];

// Fitness goals
const fitnessGoals = [
  "Weight Loss",
  "Muscle Building",
  "Strength Training",
  "Cardiovascular Health",
  "General Fitness",
  "Sports Performance",
  "Rehabilitation",
  "Other"
];

// Allow undefined values in FormErrors
type FormErrors = {
  [key: string]: string | undefined;
};

// Image URL helper function
const getImageUrl = (imagePath: string | undefined | null, fallback: string = "/storage/default-gym.jpg"): string => {
  if (!imagePath) return fallback;

  // If it's already a full URL, use it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it starts with /, use it as is (absolute path)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // For relative paths from storage, prepend with /storage/
  // This assumes your files are in storage/app/public and you have a symlink
  return `/storage/${imagePath}`;
};

const GymBooking = () => {
  const { gym: backendGym } = usePage<PageProps & { gym: GymProps['gym'] }>().props;

  useEffect(() => {
    console.log('GymBooking: Backend Props:', { backendGym });
  }, [backendGym]);

  const gym = backendGym;

  useEffect(() => {
    console.log('GymBooking: Processed Gym:', { gym });
  }, [gym]);

  const [formData, setFormData] = useState<MembershipFormData>({
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
    fitnessGoals: "",
    membershipType: 'membership',
    durationMonths: 1,
    familyPack: false,
    preferredStartDate: "",
    preferredTime: "",
    paymentMethod: "Credit Card",
    specialRequirements: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showGoalsDropdown, setShowGoalsDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const goalsDropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  // Calculate pricing based on gym price and membership options
  const calculatePricing = useMemo((): Pricing | null => {
    if (!gym?.price) return null;

    // Extract numeric price from string (handles "₵50" or "50" formats)
    const basePrice = parseFloat(gym.price.replace(/[^\d.]/g, '')) || 0;

    if (formData.membershipType === 'visit') {
      // Single visit: 10% of original price
      const visitPrice = basePrice * 0.1;
      const tax = visitPrice * 0.1; // 10% tax
      const serviceCharge = visitPrice * 0.05; // 5% service charge
      const total = visitPrice + tax + serviceCharge;

      return {
        type: 'single_visit',
        basePrice: basePrice,
        visitPrice: visitPrice,
        tax: tax,
        serviceCharge: serviceCharge,
        total: total,
        description: 'Single Visit (10% of regular price)'
      };
    } else {
      // Membership: price per month
      let monthlyPrice = basePrice;

      // Apply family pack discount (20% off)
      if (formData.familyPack) {
        monthlyPrice = basePrice * 0.8;
      }

      const subtotal = monthlyPrice * formData.durationMonths;
      const tax = subtotal * 0.1; // 10% tax
      const serviceCharge = subtotal * 0.05; // 5% service charge
      const total = subtotal + tax + serviceCharge;

      return {
        type: 'membership',
        basePrice: basePrice,
        monthlyPrice: monthlyPrice,
        duration: formData.durationMonths,
        familyPack: formData.familyPack,
        subtotal: subtotal,
        tax: tax,
        serviceCharge: serviceCharge,
        total: total,
        description: formData.familyPack
          ? `Family Pack Membership (20% off) - ${formData.durationMonths} month${formData.durationMonths > 1 ? 's' : ''}`
          : `Regular Membership - ${formData.durationMonths} month${formData.durationMonths > 1 ? 's' : ''}`
      };
    }
  }, [gym?.price, formData.membershipType, formData.durationMonths, formData.familyPack]);

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
  const handleInputChange = (field: keyof MembershipFormData, value: any): void => {
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

    // Membership Details
    if (!formData.preferredStartDate) newErrors.preferredStartDate = "Start date is required";
    if (!formData.preferredTime) newErrors.preferredTime = "Preferred time is required";
    if (!formData.fitnessGoals) newErrors.fitnessGoals = "Fitness goals are required";

    // Membership specific validations
    if (formData.membershipType === 'membership' && formData.durationMonths < 1) {
      newErrors.durationMonths = "Duration must be at least 1 month";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm() || !gym || !calculatePricing) {
    console.log('handleSubmit: Validation failed or no gym/pricing data');
    return;
  }

  setIsSubmitting(true);
  try {
    const bookingData = {
      type: 'gym_booking',

      // ✅ FIXED: Converted to snake_case to match backend
      gym_id: gym.id,
      gym_name: gym.name,
      gym_location: gym.location,
      gym_image: getImageUrl(gym.main_image),
      gym_type: gym.gym_type,
      equipment_type: gym.equipment_type,

      // Membership details - ✅ FIXED field names
      membership_type: formData.membershipType,
      duration_months: formData.durationMonths,
      family_pack: formData.familyPack,

      // Pricing - ✅ FIXED field names
      base_price: calculatePricing.basePrice,
      final_price: calculatePricing.total,
      subtotal: calculatePricing.subtotal || calculatePricing.total,
      pricing_breakdown: calculatePricing,

      // Personal information - ✅ FIXED: Added required customer_ fields
      customer_first_name: formData.firstName,
      customer_last_name: formData.lastName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_country: formData.country,
      customer_city: formData.city,
      address: formData.address, // This one stays as 'address' based on your backend rules

      // Emergency contact - ✅ FIXED field names
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,

      // Health and fitness - ✅ FIXED field names
      health_conditions: formData.healthConditions,
      fitness_goals: formData.fitnessGoals,

      // Schedule - ✅ FIXED field names
      preferred_start_date: formData.preferredStartDate,
      preferred_time: formData.preferredTime,
      payment_method: formData.paymentMethod,

      // Optional fields
      special_requirements: formData.specialRequirements
    };

    console.log('🔄 Submitting gym booking data:', bookingData);

    await router.post('/cart', bookingData, {
      onSuccess: () => {
        console.log('✅ Successfully added gym booking to cart');
        router.visit('/cart');
      },
      onError: (errors: Record<string, string>) => {
        console.error('❌ Failed to add gym booking to cart:', errors);
        alert('Failed to add gym booking to cart. Please try again.');
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
      const refs = [countryDropdownRef, timeDropdownRef, paymentDropdownRef, goalsDropdownRef];
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          if (ref === countryDropdownRef) setShowCountryDropdown(false);
          if (ref === timeDropdownRef) setShowTimeDropdown(false);
          if (ref === paymentDropdownRef) setShowPaymentDropdown(false);
          if (ref === goalsDropdownRef) setShowGoalsDropdown(false);
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!gym) {
    return (
      <MainLayout>
        <div className="bg-gray-100 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-600">Unable to load gym information. Please try again later or contact support.</p>
              <button
                onClick={() => router.visit('/gyms')}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Back to Gyms
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
              <h2 className="text-xl font-bold mb-4 text-white">{gym.name}</h2>
              <div className="flex flex-col items-center">
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(gym.main_image)}
                    alt={gym.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/storage/default-gym.jpg";
                    }}
                  />
                </div>
                <div className="w-full mt-4 text-center">
                  <p className="text-sm text-gray-400 uppercase">{gym.location}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {gym.gym_type || 'Fitness Gym'} • {gym.equipment_type || 'Various Equipment'}
                  </p>
                  <div className="mt-2 px-3 py-1 bg-green-500 rounded-full text-xs font-semibold text-white">
                    🟢 Active Membership Available
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Summary */}
            {calculatePricing && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Membership Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Membership Type:</span>
                    <span className="font-semibold text-sm text-right">
                      {calculatePricing.type === 'single_visit' ? 'Single Visit' :
                       formData.familyPack ? 'Family Pack' : 'Regular Membership'}
                    </span>
                  </div>

                  {calculatePricing.type === 'single_visit' ? (
                    <>
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Regular Price:</span>
                        <span className="font-semibold">${calculatePricing.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Visit Price (10%):</span>
                        <span className="font-semibold">${calculatePricing.visitPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Monthly Price:</span>
                        <span className="font-semibold">
                          ${calculatePricing.monthlyPrice?.toFixed(2) || '0.00'}
                          {formData.familyPack && (
                            <span className="text-sm text-green-600 ml-1">(20% off)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Duration:</span>
                        <span className="font-semibold">{formData.durationMonths} month{formData.durationMonths > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300">
                        <span>Subtotal:</span>
                        <span className="font-semibold">${calculatePricing.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tax (10%):</span>
                    <span className="font-semibold">${calculatePricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Service Charge (5%):</span>
                    <span className="font-semibold">${calculatePricing.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 font-bold text-lg text-green-600 dark:text-green-400">
                    <span>Total:</span>
                    <span>${calculatePricing.total.toFixed(2)}</span>
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
                    ${calculatePricing ? (calculatePricing.total * 0.1).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cancel for Free Till:</span>
                  <span className="text-green-400 font-bold">7 Days Before Start</span>
                </div>
              </div>
            </section>

            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-white mb-4">Membership Benefits</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                <li>Access to all gym facilities and equipment</li>
                <li>Free fitness assessment</li>
                <li>Personalized workout plan</li>
                <li>Locker room access</li>
                <li>Group classes (where available)</li>
                <li>24/7 access (for eligible memberships)</li>
              </ul>
            </section>

            {gym.contact_phone || gym.contact_email ? (
              <section className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
                <div className="space-y-3 text-sm text-gray-300">
                  {gym.contact_phone && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      <span>{gym.contact_phone}</span>
                    </div>
                  )}
                  {gym.contact_email && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      <span>{gym.contact_email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    <span>{gym.location}</span>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          {/* Main Content Area - Right Column */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            <section className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-white mb-6">Gym Membership Registration</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            className="flex items-center px-3 py-2 bg-gray-500 border border-r-0 border-gray-500 rounded-l-md text-white"
                          >
                            <span className="mr-2">{selectedCountry.flag}</span>
                            <span>{selectedCountry.phoneCode}</span>
                          </button>
                          {showCountryDropdown && (
                            <div className="absolute z-10 w-48 mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg max-h-60 overflow-auto">
                              {countries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setShowCountryDropdown(false);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-500"
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
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-r-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your country"
                      />
                      {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your city"
                      />
                      {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your full address"
                    />
                    {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Contact Name *</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Full name of emergency contact"
                      />
                      {errors.emergencyContact && <p className="text-red-400 text-sm mt-1">{errors.emergencyContact}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Contact Phone *</label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Emergency contact phone"
                      />
                      {errors.emergencyPhone && <p className="text-red-400 text-sm mt-1">{errors.emergencyPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Membership Type */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Membership Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Membership Option *</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="membershipType"
                            value="membership"
                            checked={formData.membershipType === 'membership'}
                            onChange={(e) => handleInputChange('membershipType', e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-white">Monthly Membership</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="membershipType"
                            value="visit"
                            checked={formData.membershipType === 'visit'}
                            onChange={(e) => handleInputChange('membershipType', e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-white">Single Visit (10% of regular price)</span>
                        </label>
                      </div>
                    </div>

                    {formData.membershipType === 'membership' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Months) *</label>
                          <select
                            value={formData.durationMonths}
                            onChange={(e) => handleInputChange('durationMonths', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                              <option key={month} value={month}>
                                {month} month{month > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                          {errors.durationMonths && <p className="text-red-400 text-sm mt-1">{errors.durationMonths}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.familyPack}
                              onChange={(e) => handleInputChange('familyPack', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-white font-medium">Family Pack (20% discount)</span>
                          </label>
                          <p className="text-gray-400 text-sm mt-1">
                            Select this option if you're registering for multiple family members
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Health & Fitness */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Health & Fitness Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative" ref={goalsDropdownRef}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fitness Goals *</label>
                      <button
                        type="button"
                        onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.fitnessGoals || "Select your fitness goals"}
                      </button>
                      {showGoalsDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg max-h-60 overflow-auto">
                          {fitnessGoals.map((goal) => (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => {
                                handleInputChange('fitnessGoals', goal);
                                setShowGoalsDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-white hover:bg-gray-500 text-left"
                            >
                              {goal}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.fitnessGoals && <p className="text-red-400 text-sm mt-1">{errors.fitnessGoals}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Health Conditions / Injuries</label>
                      <textarea
                        value={formData.healthConditions}
                        onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Please list any health conditions, injuries, or medical concerns we should be aware of..."
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Payment */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Schedule & Payment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Start Date *</label>
                      <input
                        type="date"
                        min={today}
                        value={formData.preferredStartDate}
                        onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {errors.preferredStartDate && <p className="text-red-400 text-sm mt-1">{errors.preferredStartDate}</p>}
                    </div>

                    <div className="relative" ref={timeDropdownRef}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Time *</label>
                      <button
                        type="button"
                        onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.preferredTime ? formatTime(formData.preferredTime) : "Select preferred time"}
                      </button>
                      {showTimeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg max-h-60 overflow-auto">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                handleInputChange('preferredTime', time);
                                setShowTimeDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-white hover:bg-gray-500 text-left"
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.preferredTime && <p className="text-red-400 text-sm mt-1">{errors.preferredTime}</p>}
                    </div>

                    <div className="relative" ref={paymentDropdownRef}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method *</label>
                      <button
                        type="button"
                        onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {formData.paymentMethod}
                      </button>
                      {showPaymentDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg max-h-60 overflow-auto">
                          {paymentMethods.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                handleInputChange('paymentMethod', method);
                                setShowPaymentDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-white hover:bg-gray-500 text-left"
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements</label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special requirements or preferences..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !calculatePricing}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    isSubmitting || !calculatePricing
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } transition`}
                >
                  {isSubmitting ? 'Processing...' : `Add to Cart - $${calculatePricing?.total.toFixed(2) || '0.00'}`}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GymBooking;
