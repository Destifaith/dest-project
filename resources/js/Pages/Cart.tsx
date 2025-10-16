// resources/js/Pages/Main/Cart.tsx
import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Pages/Layouts/MainLayout';

// Beach booking - UPDATED to snake_case
// Beach booking - UPDATED to snake_case
interface BeachCartItem {
  type: 'beach';
  id: string;
  beach_id: number;
  beach_name: string;
  beach_location: string;
  beach_image_url: string;
  adult_price: number;
  child_price: number;
  adults: number;
  children: number;
  preferred_date: string;
  subtotal: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  customer_city: string;
  customer_address?: string;
}

// Eatery reservation - UPDATED to snake_case
interface EateryReservationCartItem {
  type: 'eatery_reservation';
  id: string;
  eatery_id: number;
  eatery_name: string;
  eatery_location: string;
  eatery_image: string;
  cuisine_type?: string;
  price_per_person: number;
  number_of_people: number;
  preferred_date: string;
  preferred_time: string;
  table_preference?: string;
  occasion?: string;
  special_requirements?: string;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  customer_city: string;
  customer_address?: string;
}

// Eatery delivery - UPDATED to snake_case
interface EateryDeliveryCartItem {
  type: 'eatery_delivery';
  id: string;
  eatery_id: number;
  eatery_name: string;
  eatery_location: string;
  eatery_image: string;
  cuisine_type?: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; category?: string }>;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_distance: number;
  delivery_address: string;
  delivery_apartment?: string;
  delivery_postal_code?: string;
  delivery_instructions?: string;
  preferred_date: string;
  preferred_time: string;
  payment_method: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  customer_city: string;
}

// Gym booking - UPDATED to snake_case
// Gym booking - UPDATED to snake_case with subtotal
interface GymBookingCartItem {
  type: 'gym_booking';
  id: string;
  gym_id: number;
  gym_name: string;
  gym_location: string;
  gym_image: string;
  gym_type?: string;
  equipment_type?: string;
  membership_type: 'visit' | 'membership';
  duration_months: number;
  family_pack: boolean;
  base_price: number;
  final_price: number;
  subtotal: number; // ✅ ADDED THIS LINE
  emergency_contact: string;
  emergency_phone: string;
  health_conditions?: string;
  fitness_goals: string;
  preferred_start_date: string;
  preferred_time: string;
  payment_method: string;
  address: string;
  pricing_breakdown?: any;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  customer_city: string;
}

// ADD THIS - Spa booking interface
interface SpaBookingCartItem {
  type: 'spa_booking';
  id: string;
  spa_id: number;
  spa_name: string;
  spa_location: string;
  spa_image: string;
  spa_type?: string;
  ambiance_type?: string;
  booking_type: 'treatment' | 'package' | 'day_pass';
  treatment_type?: string;
  duration_hours: number;
  number_of_guests: number;
  base_price: number;
  final_price: number;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  preferred_date: string;
  preferred_time: string;
  payment_method: string;
  aromatherapy_preference?: string;
  therapist_gender_preference?: string;
  wellness_goals?: string;
  health_conditions?: string;
  special_requirements?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  customer_city: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  pricing_breakdown?: any;
}

type CartItem = BeachCartItem | EateryReservationCartItem | EateryDeliveryCartItem | GymBookingCartItem | SpaBookingCartItem;

interface CartProps {
  cartItems: CartItem[];
}

// UPDATED Helper functions for type-safe access
const getImageUrl = (item: CartItem): string => {
  switch (item.type) {
    case 'beach': return item.beach_image_url;
    case 'eatery_reservation':
    case 'eatery_delivery': return item.eatery_image;
    case 'gym_booking': return item.gym_image;
    case 'spa_booking': return item.spa_image; // ADD THIS LINE
    default: return "/storage/default-placeholder.jpg";
  }
};

const getName = (item: CartItem): string => {
  switch (item.type) {
    case 'beach': return item.beach_name;
    case 'eatery_reservation':
    case 'eatery_delivery': return item.eatery_name;
    case 'gym_booking': return item.gym_name;
    case 'spa_booking': return item.spa_name; // ADD THIS LINE
    default: return 'Unknown';
  }
};

const getLocation = (item: CartItem): string => {
  switch (item.type) {
    case 'beach': return item.beach_location;
    case 'eatery_reservation':
    case 'eatery_delivery': return item.eatery_location;
    case 'gym_booking': return item.gym_location;
    case 'spa_booking': return item.spa_location; // ADD THIS LINE
    default: return 'Unknown Location';
  }
};

const getDate = (item: CartItem): string => {
  switch (item.type) {
    case 'beach':
    case 'eatery_reservation':
    case 'eatery_delivery': return item.preferred_date;
    case 'gym_booking': return item.preferred_start_date;
    case 'spa_booking': return item.preferred_date; // ADD THIS LINE
    default: return '';
  }
};

const Cart: React.FC<CartProps> = ({ cartItems }) => {
  const { props } = usePage();
  const flash = props.flash as { success?: string };

  // Calculate totals including delivery fees - FIXED
  const subtotal = cartItems.reduce((sum, item) => {
    switch (item.type) {
      case 'eatery_reservation':
        return sum + (item.total || item.subtotal);
      case 'gym_booking':
        return sum + (item.final_price || item.subtotal || 0); // ✅ Handle gym booking
        case 'spa_booking': // ADD THIS CASE
      return item.final_price || item.total || item.subtotal || 0;
      default:
        return sum + (item.subtotal || 0);
    }
  }, 0);

  const deliveryFees = cartItems
    .filter((item): item is EateryDeliveryCartItem => item.type === 'eatery_delivery')
    .reduce((sum, item) => sum + (item.delivery_fee || 0), 0);

  const tax = cartItems.reduce((sum, item) => {
    if (item.type === 'eatery_reservation' || item.type === 'eatery_delivery') {
      return sum + (item.tax || 0);
    }
    return sum;
  }, 0);

  const total = subtotal + deliveryFees + tax;

  // Helper function to get display price for each item - ADD THIS FUNCTION
  const getDisplayPrice = (item: CartItem): number => {
    switch (item.type) {
      case 'eatery_reservation':
        return item.total || item.subtotal;
      case 'gym_booking':
        return item.final_price || item.subtotal || 0; // ✅ Handle gym booking
      default:
        return item.subtotal || 0;
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      router.delete(`/cart/${itemId}`);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    alert('Checkout functionality coming soon!');
  };

  return (
    <MainLayout>
      <Head title="Your Cart" />

      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Cart</h1>

          {flash?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 max-w-4xl mx-auto">
              {flash.success}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
              <p className="text-gray-600 mb-4">Your cart is empty.</p>
              <button
                onClick={() => router.visit('/')}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Browse Experiences
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={getImageUrl(item)}
                        alt={getName(item)}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/storage/default-placeholder.jpg";
                        }}
                      />
                      <div className="flex-1 flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {getName(item)}
                          </h3>
                          <p className="text-gray-600">
                            {getLocation(item)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Date: {new Date(getDate(item)).toLocaleDateString()}
                            {(item.type === 'eatery_delivery' || item.type === 'eatery_reservation') && (
                              ` at ${(item as any).preferred_time}`
                            )}
                            {item.type === 'gym_booking' && (
                              ` at ${item.preferred_time}`
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Guest: {item.customer_first_name} {item.customer_last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Contact: {item.customer_phone} • {item.customer_email}
                          </p>

                          {/* Type-specific details */}
                         {item.type === 'beach' && (
  <div className="mt-3  text-gray-900">
    <p><strong>Guests:</strong> {item.adults} Adult(s), {item.children} Child(ren)</p>
    {/* <p><strong>Price Breakdown:</strong></p> */}
    <div className="text-sm text-gray-600 ml-2">
      {/* <p>Adult: ${item.adult_price?.toFixed(2)} × {item.adults} = ${(item.adult_price * item.adults).toFixed(2)}</p>
      <p>Child: ${item.child_price?.toFixed(2)} × {item.children} = ${(item.child_price * item.children).toFixed(2)}</p> */}
      {/* <p className="font-semibold">Subtotal: ${item.subtotal?.toFixed(2)}</p> */}
    </div>
  </div>
)}
                          {item.type === 'eatery_reservation' && (
                            <p className="mt-  text-gray-900">
                              <strong>Guests:</strong> {item.number_of_people} Person(s)
                            </p>
                          )}
                          {item.type === 'eatery_delivery' && (
                            <div className="mt-3">
                              <strong>Order:</strong>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {item.items.map((food, idx) => (
                                  <li key={idx}>
                                    {food.name} × {food.quantity} — ${food.price.toFixed(2)}
                                  </li>
                                ))}
                              </ul>
                              <p className="mt-2">
                                <strong>Delivery Address:</strong> {item.delivery_address}
                                {item.delivery_apartment && `, ${item.delivery_apartment}`}
                              </p>
                              <p className="mt-1">
                                <strong>Delivery Fee:</strong> ${item.delivery_fee.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {item.type === 'gym_booking' && (
                            <div className="mt-3  text-gray-900">
                              {/* <p><strong>Membership Type:</strong> {item.membership_type === 'visit' ? 'Single Visit' : 'Monthly Membership'}</p> */}
                              {item.membership_type === 'membership' && (
                                <>
                                  {/* <p><strong>Duration:</strong> {item.duration_months} month{item.duration_months > 1 ? 's' : ''}</p>
                                  <p><strong>Family Pack:</strong> {item.family_pack ? 'Yes (20% off)' : 'No'}</p> */}
                                </>
                              )}
                              {/* <p><strong>Fitness Goals:</strong> {item.fitness_goals}</p> */}
                              {/* {item.health_conditions && (
                                <p><strong>Health Notes:</strong> {item.health_conditions}</p>
                              )} */}
                              {/* <p><strong>Emergency Contact:</strong> {item.emergency_contact} ({item.emergency_phone})</p> */}
                            </div>
                          )}
{item.type === 'spa_booking' && (
  <div className="mt-3 text-gray-900">
    <p><strong>Booking Type:</strong>
      {item.booking_type === 'treatment' ? 'Individual Treatment' :
       item.booking_type === 'package' ? 'Wellness Package' : 'Day Pass'}
    </p>
    {item.treatment_type && (
      <p><strong>Treatment:</strong> {item.treatment_type}</p>
    )}
    {item.booking_type === 'treatment' && (
      <p><strong>Duration:</strong> {item.duration_hours} hour{item.duration_hours > 1 ? 's' : ''}</p>
    )}
    <p><strong>Guests:</strong> {item.number_of_guests}</p>
    {item.aromatherapy_preference && item.aromatherapy_preference !== 'No Preference' && (
      <p><strong>Aromatherapy:</strong> {item.aromatherapy_preference}</p>
    )}
    {item.therapist_gender_preference && item.therapist_gender_preference !== 'No Preference' && (
      <p><strong>Therapist Preference:</strong> {item.therapist_gender_preference}</p>
    )}
    {item.wellness_goals && (
      <p><strong>Wellness Goals:</strong> {item.wellness_goals}</p>
    )}
  </div>
)}
                        </div>

                        {/* Price and Remove Button */}
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <p className="text-lg font-bold text-green-600">
                            ${getDisplayPrice(item).toFixed(2)} {/* ✅ Use the helper function */}
                            {item.type === 'eatery_delivery' && (
                              <span className="block text-sm font-normal mt-1 text-right">
                                + ${item.delivery_fee.toFixed(2)} delivery
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
                <div className="space-y-3">
                  <div className="border-t pt-3  text-gray-900 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={cartItems.length === 0}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium transition ${
                      cartItems.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={() => router.visit('/')}
                    className="w-full py-3 px-4 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 transition"
                  >
                    ← Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
