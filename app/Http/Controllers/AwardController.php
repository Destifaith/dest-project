<?php

namespace App\Http\Controllers;

use App\Models\Award;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AwardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $awards = Award::with('restaurant')->latest()->get();
        return response()->json($awards);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_id' => 'required|exists:restaurants,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'year' => 'required|string|max:4',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $imagePath = null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('restaurants/awards', 'public');
            }

            $award = Award::create([
                'restaurant_id' => $request->restaurant_id,
                'title' => $request->title,
                'description' => $request->description,
                'year' => $request->year,
                'image' => $imagePath,
            ]);

            return response()->json([
                'message' => 'Award created successfully',
                'award' => $award->load('restaurant')
            ], 201);
        } catch (\Exception $e) {
            if (isset($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'message' => 'Error creating award',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Award $award)
    {
        return response()->json($award->load('restaurant'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Award $award)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'year' => 'sometimes|required|string|max:4',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->except('image');

            if ($request->hasFile('image')) {
                // Delete old image
                if ($award->image) {
                    Storage::disk('public')->delete($award->image);
                }
                $updateData['image'] = $request->file('image')->store('restaurants/awards', 'public');
            }

            $award->update($updateData);

            return response()->json([
                'message' => 'Award updated successfully',
                'award' => $award->load('restaurant')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating award',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Award $award)
    {
        try {
            if ($award->image) {
                Storage::disk('public')->delete($award->image);
            }

            $award->delete();

            return response()->json([
                'message' => 'Award deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting award',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get awards by restaurant
     */
    public function getByRestaurant($restaurantId)
    {
        $awards = Award::where('restaurant_id', $restaurantId)
            ->with('restaurant')
            ->latest()
            ->get();

        return response()->json($awards);
    }
}
