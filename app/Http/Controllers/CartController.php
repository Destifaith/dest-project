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
     * POST /cart
     */
    public function store(Request $request)
    {
        // Validate the shared 'type' field first
        $request->validate([
            'type' => ['required', Rule::in(['beach', 'eatery_reservation', 'eatery_delivery'])],
        ]);

        $type = $request->input('type');
        $rules = [];
        $messages = [];

        // Conditional validation based on type
        if ($type === 'beach') {
            $rules = [
                'beachId' => 'required|integer',
                'beachName' => 'required|string',
                'beachLocation' => 'required|string',
                'beachImageUrl' => 'required|string',
                'adultPrice' => 'required|numeric',
                'childPrice' => 'required|numeric',
                'adults' => 'required|integer|min:0',
                'children' => 'required|integer|min:0',
                'preferredDate' => 'required|date',
            ];
        } elseif ($type === 'eatery_reservation') {
            $rules = [
                'eateryId' => 'required|integer',
                'eateryName' => 'required|string',
                'eateryLocation' => 'required|string',
                'eateryImageUrl' => 'required|string',
                'pricePerPerson' => 'required|numeric',
                'numberOfPeople' => 'required|integer|min:1',
                'preferredDate' => 'required|date',
            ];
        } elseif ($type === 'eatery_delivery') {
            $rules = [
                'eateryId' => 'required|integer',
                'eateryName' => 'required|string',
                'eateryLocation' => 'required|string',
                'eateryImageUrl' => 'required|string',
                'items' => 'required|array|min:1',
                'items.*.name' => 'required|string',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.quantity' => 'required|integer|min:1',
                'deliveryFee' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'deliveryDistance' => 'required|numeric|min:0',
                'deliveryLocation' => 'required|array',
                'deliveryLocation.address' => 'required|string',
                'preferredDate' => 'required|date',
                'preferredTime' => 'required|string',
            ];
        }

        // Shared user info (required for all types)
        $rules = array_merge($rules, [
            'subtotal' => 'required|numeric|min:0',
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'countryCode' => 'required|string',
            'country' => 'required|string',
            'city' => 'required|string',
        ]);

        // Validate with dynamic rules
        $validated = $request->validate($rules, $messages);

        // Generate unique ID
        $itemId = md5(uniqid() . time());

        // Save to session
        $cart = Session::get('cart', collect());
        $cart->put($itemId, array_merge($validated, ['id' => $itemId, 'type' => $type]));
        Session::put('cart', $cart);

        // Optional: Log for debugging
        Log::info("Cart item added: {$type}", [
            'id' => $itemId,
            'data' => $validated,
        ]);

        return redirect()->route('cart.index')->with('success', 'Item added to cart!');
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
            $cart->forget($id);
            Session::put('cart', $cart);
            return redirect()->back()->with('success', 'Item removed from cart.');
        }

        return redirect()->back()->withErrors('Item not found in cart.');
    }

    /**
     * Clear entire cart (optional)
     */
    public function clear()
    {
        Session::forget('cart');
        return redirect('/')->with('success', 'Cart cleared.');
    }
}
