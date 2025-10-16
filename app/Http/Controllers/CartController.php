<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class CartController extends Controller
{
    /**
     * Display the cart contents.
     *
     * GET /cart
     */
    public function index()
    {
        $cart = Session::get('cart', collect());
        return inertia('Cart', [
            'cartItems' => $cart->values(),
        ]);
    }

    /**
     * Add an item to the cart.
     *
     * POST /cart/add
     */
    /**
     * Add an item to the cart.
     *
     * POST /cart
     */
    public function store(Request $request)
    {
        Log::info('Cart store request received:', $request->all());

        // Validate the shared 'type' field first
        $request->validate([
            'type' => ['required', Rule::in(['beach', 'eatery_reservation', 'eatery_delivery', 'gym_booking', 'spa_booking'])],
        ]);

        $type = $request->input('type');
        $rules = [];
        $messages = [];

        // Conditional validation based on type
        if ($type === 'beach') {
            $rules = [
                'beach_id' => 'required|integer',
                'beach_name' => 'required|string|max:255',
                'beach_location' => 'required|string|max:500',
                'beach_image_url' => 'required|string',
                'adult_price' => 'required|numeric|min:0',
                'child_price' => 'required|numeric|min:0',
                'adults' => 'required|integer|min:0',
                'children' => 'required|integer|min:0',
                'preferred_date' => 'required|date',
                'subtotal' => 'required|numeric|min:0', // ✅ Make sure this is here
            ];
        } elseif ($type === 'eatery_reservation') {
            $rules = [
                'eatery_id' => 'required|integer',
                'eatery_name' => 'required|string|max:255',
                'eatery_location' => 'required|string|max:500',
                'eatery_image' => 'required|string',
                'cuisine_type' => 'nullable|string|max:255',
                'price_per_person' => 'required|numeric|min:0',
                'number_of_people' => 'required|integer|min:1',
                'preferred_date' => 'required|date',
                'preferred_time' => 'required|string',
                'table_preference' => 'nullable|string|max:255',
                'occasion' => 'nullable|string|max:255',
                'special_requirements' => 'nullable|string',
                'subtotal' => 'required|numeric|min:0',
                'tax' => 'required|numeric|min:0',
                'service_charge' => 'required|numeric|min:0',
                'total' => 'required|numeric|min:0',
            ];
        } elseif ($type === 'eatery_delivery') {
            $rules = [
                'eatery_id' => 'required|integer',
                'eatery_name' => 'required|string|max:255',
                'eatery_location' => 'required|string|max:500',
                'eatery_image' => 'required|string',
                'cuisine_type' => 'nullable|string|max:255',
                'items' => 'required|array|min:1',
                'items.*.id' => 'required|string',
                'items.*.name' => 'required|string|max:255',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.category' => 'nullable|string|max:255',
                'subtotal' => 'required|numeric|min:0',
                'delivery_fee' => 'required|numeric|min:0',
                'tax' => 'required|numeric|min:0',
                'total' => 'required|numeric|min:0',
                'delivery_distance' => 'required|numeric|min:0',
                'delivery_address' => 'required|string|max:500',
                'delivery_apartment' => 'nullable|string|max:255',
                'delivery_postal_code' => 'nullable|string|max:20',
                'delivery_instructions' => 'nullable|string',
                'preferred_date' => 'required|date',
                'preferred_time' => 'required|string',
                'payment_method' => 'required|string|max:255',
            ];
        } elseif ($type === 'gym_booking') {
            $rules = [
                'gym_id' => 'required|integer',
                'gym_name' => 'required|string|max:255',
                'gym_location' => 'required|string|max:500',
                'gym_image' => 'required|string',
                'gym_type' => 'nullable|string|max:255',
                'equipment_type' => 'nullable|string|max:255',
                'membership_type' => 'required|in:visit,membership',
                'duration_months' => 'required_if:membership_type,membership|integer|min:1|max:24',
                'family_pack' => 'boolean',
                'base_price' => 'required|numeric|min:0',
                'final_price' => 'required|numeric|min:0',
                'emergency_contact' => 'required|string|max:255',
                'emergency_phone' => 'required|string',
                'health_conditions' => 'nullable|string',
                'fitness_goals' => 'required|string|max:255',
                'preferred_start_date' => 'required|date',
                'preferred_time' => 'required|string',
                'payment_method' => 'required|string|max:255',
                'address' => 'required|string|max:500',
                'pricing_breakdown' => 'nullable|array',
            ];
        } elseif ($type === 'spa_booking') {
            $rules = [
                'spa_id' => 'required|integer',
                'spa_name' => 'required|string|max:255',
                'spa_location' => 'required|string|max:500',
                'spa_image' => 'required|string',
                'spa_type' => 'nullable|string|max:255',
                'ambiance_type' => 'nullable|string|max:255',
                'booking_type' => 'required|in:treatment,package,day_pass',
                'treatment_type' => 'nullable|string|max:255',
                'duration_hours' => 'required_if:booking_type,treatment|numeric|min:0.5|max:8',
                'number_of_guests' => 'required|integer|min:1|max:10',
                'base_price' => 'required|numeric|min:0',
                'final_price' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'tax' => 'required|numeric|min:0',
                'service_charge' => 'required|numeric|min:0',
                'total' => 'required|numeric|min:0',
                'preferred_date' => 'required|date',
                'preferred_time' => 'required|string',
                'payment_method' => 'required|string|max:255',
                'aromatherapy_preference' => 'nullable|string|max:255',
                'therapist_gender_preference' => 'nullable|string|max:255',
                'wellness_goals' => 'nullable|string',
                'health_conditions' => 'nullable|string',
                'special_requirements' => 'nullable|string',
                'emergency_contact' => 'required|string|max:255',
                'emergency_phone' => 'required|string',
                'pricing_breakdown' => 'nullable|array',
            ];
        }

        // Shared user info (required for all types)
        $sharedRules = [
            'customer_first_name' => 'required|string|max:255',
            'customer_last_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_country' => 'required|string|max:255',
            'customer_city' => 'required|string|max:255',
        ];

        // For gym_booking, address is already included in type-specific rules
        if ($type !== 'gym_booking' && $type !== 'spa_booking') {
            $sharedRules['customer_address'] = 'nullable|string|max:500';
        }
        // ✅ UPDATE: For spa_booking, add address to shared rules if not already in type-specific
        if ($type === 'spa_booking') {
            $rules['address'] = 'required|string|max:500';
        }
        $rules = array_merge($rules, $sharedRules);

        Log::info("Validation rules for {$type}:", $rules);

        try {
            // Validate with dynamic rules
            $validated = $request->validate($rules, $messages);

            // Generate unique ID
            $itemId = md5(uniqid() . time());

            // Prepare cart item data
            $cartItem = array_merge($validated, [
                'id' => $itemId,
                'type' => $type,
                'created_at' => now()->toISOString()
            ]);

            // Save to session
            $cart = Session::get('cart', collect());
            $cart->put($itemId, $cartItem);
            Session::put('cart', $cart);

            Log::info("Cart item added successfully: {$type}", [
                'id' => $itemId,
                'name' => $cartItem['spa_name'] ?? ['gym_name'] ?? $cartItem['beach_name'] ?? $cartItem['eatery_name'] ?? 'Unknown',
                'total' => $cartItem['total'] ?? $cartItem['final_price'] ?? 0
            ]);

            // ✅ FIX: Return proper Inertia redirect instead of JSON
            return redirect()->route('cart.index')->with('success', 'Item added to cart successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Cart validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            // ✅ FIX: Return back with errors for Inertia
            return back()->withErrors($e->errors())->withInput();
        }
    }

    /**
     * Remove item from cart.
     *
     * DELETE /cart/{id}
     */
    public function destroy($id)
    {
        $cart = Session::get('cart', collect());

        if ($cart->has($id)) {
            $removedItem = $cart->get($id);
            $cart->forget($id);
            Session::put('cart', $cart);

            Log::info("Cart item removed", [
                'id' => $id,
                'type' => $removedItem['type'],
                'name' => $removedItem['spa_name'] ?? ['gym_name'] ?? $removedItem['beach_name'] ?? $removedItem['eatery_name'] ?? 'Unknown'
            ]);

            return redirect()->back()->with('success', 'Item removed from cart.');
        }

        return redirect()->back()->withErrors('Item not found in cart.');
    }

    /**
     * Clear entire cart
     */
    public function clear()
    {
        $cartCount = Session::get('cart', collect())->count();
        Session::forget('cart');

        Log::info("Cart cleared", ['items_count' => $cartCount]);

        return redirect('/')->with('success', 'Cart cleared.');
    }

    /**
     * Get cart count
     */
    public function count()
    {
        $cart = Session::get('cart', collect());
        return response()->json(['count' => $cart->count()]);
    }

    /**
     * Update cart item quantity (for delivery items)
     */
    public function update(Request $request, $id)
    {
        $cart = Session::get('cart', collect());

        if (!$cart->has($id)) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart.'
            ], 404);
        }

        $item = $cart->get($id);

        // Only allow updates for delivery items with quantity field
        if ($item['type'] === 'eatery_delivery' && $request->has('quantity')) {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
                'item_index' => 'required|integer|min:0'
            ]);

            $itemIndex = $validated['item_index'];

            if (isset($item['items'][$itemIndex])) {
                $item['items'][$itemIndex]['quantity'] = $validated['quantity'];

                // Recalculate subtotal
                $item['subtotal'] = collect($item['items'])->sum(function ($cartItem) {
                    return $cartItem['price'] * $cartItem['quantity'];
                });

                // Recalculate total
                $item['total'] = $item['subtotal'] + $item['delivery_fee'] + $item['tax'];

                $cart->put($id, $item);
                Session::put('cart', $cart);

                Log::info("Cart item updated", [
                    'id' => $id,
                    'item_index' => $itemIndex,
                    'new_quantity' => $validated['quantity'],
                    'new_subtotal' => $item['subtotal'],
                    'new_total' => $item['total']
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Item quantity updated.',
                    'subtotal' => $item['subtotal'],
                    'total' => $item['total']
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Cannot update this item.'
        ], 400);
    }

    /**
     * Get cart contents as JSON (for API calls)
     */
    public function getCart()
    {
        $cart = Session::get('cart', collect());

        return response()->json([
            'success' => true,
            'cart_items' => $cart->values(),
            'cart_count' => $cart->count()
        ]);
    }
}
