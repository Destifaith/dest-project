// resources/js/Pages/Main/Cart.tsx
import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Pages/Layouts/MainLayout';

// Beach booking
interface BeachCartItem {
  type: 'beach';
  id: string;
  beachId: number;
  beachName: string;
  beachLocation: string;
  beachImageUrl: string;
  adultPrice: number;
  childPrice: number;
  adults: number;
  children: number;
  preferredDate: string;
  subtotal: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
}

// Eatery reservation
interface EateryReservationCartItem {
  type: 'eatery_reservation';
  id: string;
  eateryId: number;
  eateryName: string;
  eateryLocation: string;
  eateryImageUrl: string;
  pricePerPerson: number;
  numberOfPeople: number;
  preferredDate: string;
  subtotal: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
}

// Eatery delivery
interface EateryDeliveryCartItem {
  type: 'eatery_delivery';
  id: string;
  eateryId: number;
  eateryName: string;
  eateryLocation: string;
  eateryImageUrl: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  deliveryFee: number;
  subtotal: number;
  deliveryDistance: number;
  deliveryLocation: { address: string };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
  address: string;
  apartment: string;
  postalCode: string;
  deliveryInstructions: string;
  preferredDate: string;
  preferredTime: string;
  paymentMethod: string;
}

type CartItem = BeachCartItem | EateryReservationCartItem | EateryDeliveryCartItem;

interface CartProps {
  cartItems: CartItem[];
}

const Cart: React.FC<CartProps> = ({ cartItems }) => {
  const { props } = usePage();
  const flash = props.flash as { success?: string };

  // Calculate totals including delivery fees
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFees = cartItems
    .filter((item): item is EateryDeliveryCartItem => item.type === 'eatery_delivery')
    .reduce((sum, item) => sum + item.deliveryFee, 0);
  const tax = (subtotal + deliveryFees) > 0 ? Math.max((subtotal + deliveryFees) * 0.1, 2) : 0;
  const total = subtotal + deliveryFees + tax;

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      router.delete(`/cart/${itemId}`, {
        onSuccess: () => {
          // Inertia auto-refreshes
        },
        onError: (errors) => {
          alert('Failed to remove item. Please try again.');
          console.error('Remove item error:', errors);
        }
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    alert('Checkout functionality coming soon!');
    // router.visit('/checkout');
  };

  return (
    <MainLayout>
      <Head title="Your Cart" />

      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Cart</h1>

          {/* Flash Message */}
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
                        src={item.type === 'beach' ? item.beachImageUrl : (item as any).eateryImageUrl}
                        alt={item.type === 'beach' ? item.beachName : (item as any).eateryName}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/storage/default-placeholder.jpg";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {item.type === 'beach' ? item.beachName : (item as any).eateryName}
                        </h3>
                        <p className="text-gray-600">
                          {item.type === 'beach' ? item.beachLocation : (item as any).eateryLocation}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Date: {new Date(item.preferredDate).toLocaleDateString()}
                          {item.type === 'eatery_delivery' && ` at ${(item as EateryDeliveryCartItem).preferredTime}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Guest: {item.firstName} {item.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Contact: {item.countryCode} {item.phone} • {item.email}
                        </p>

                        {/* Type-specific details */}
                        {item.type === 'beach' && (
                          <p className="mt-3">
                            <strong>Guests:</strong> {item.adults} Adult(s), {item.children} Child(ren)
                          </p>
                        )}
                        {item.type === 'eatery_reservation' && (
                          <p className="mt-3">
                            <strong>Guests:</strong> {(item as EateryReservationCartItem).numberOfPeople} Person(s)
                          </p>
                        )}
                        {item.type === 'eatery_delivery' && (
                          <div className="mt-3">
                            <strong>Order:</strong>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {(item as EateryDeliveryCartItem).items.map((food, idx) => (
                                <li key={idx}>
                                  {food.name} × {food.quantity} — ${food.price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                            <p className="mt-2">
                              <strong>Delivery Address:</strong> {(item as EateryDeliveryCartItem).address}
                              {(item as EateryDeliveryCartItem).apartment && `, ${(item as EateryDeliveryCartItem).apartment}`}
                            </p>
                            <p className="mt-1">
                              <strong>Delivery Fee:</strong> ${(item as EateryDeliveryCartItem).deliveryFee.toFixed(2)}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex justify-between items-center">
                          <p className="text-lg font-bold text-green-600">
                            ${item.subtotal.toFixed(2)}
                            {item.type === 'eatery_delivery' && (
                              <span className="block text-sm font-normal mt-1">
                                + ${(item as EateryDeliveryCartItem).deliveryFee.toFixed(2)} delivery
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
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fees</span>
                      <span className="font-semibold">${deliveryFees.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
  <button
    onClick={handleProceedToCheckout}
    className="w-full py-3 px-4 rounded-md text-white font-medium bg-green-500 hover:bg-green-600 transition"
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

                <div className="mt-4 text-sm text-gray-500 text-center">
                  <p>By proceeding, you agree to our</p>
                  <a href="#" className="text-green-500 hover:underline">Terms & Conditions</a>
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
