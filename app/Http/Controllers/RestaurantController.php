<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\Award;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the resource (API).
     */
    public function index()
    {
        $restaurants = Restaurant::with('awards')->latest()->get();
        return response()->json($restaurants);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Basic validation for required fields
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string',
            'description' => 'required|string',
            'cuisine_type' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'contact_phone' => 'required|string|max:20',
            'owner_full_name' => 'required|string|max:255',
            'owner_bio' => 'required|string',
            'main_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'required|json',
            'features' => 'nullable|json',
            'awards' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        try {
            // Handle file uploads
            $mainImagePath = null;
            $galleryImagePaths = [];
            $menuPdfPath = null;
            $ownerImagePath = null;

            // Upload main image
            if ($request->hasFile('main_image')) {
                $mainImagePath = $request->file('main_image')->store('restaurants/main', 'public');
            }

            // Upload gallery images
            // if ($request->hasFile('gallery_images')) {
            //     foreach ($request->file('gallery_images') as $image) {
            //         $galleryImagePaths[] = $image->store('restaurants/gallery', 'public');
            //     }
            // }
            $galleryFiles = $request->file('gallery_images');
            if ($galleryFiles && is_array($galleryFiles)) {
                foreach ($galleryFiles as $image) {
                    if ($image && $image->isValid()) {
                        $galleryImagePaths[] = $image->store('restaurants/gallery', 'public');
                    }
                }
            }
            // Upload menu PDF
            if ($request->hasFile('menu_pdf')) {
                $menuPdfPath = $request->file('menu_pdf')->store('restaurants/menus', 'public');
            }

            // Upload owner image
            if ($request->hasFile('owner_image')) {
                $ownerImagePath = $request->file('owner_image')->store('restaurants/owners', 'public');
            }

            // Parse JSON data
            $openingHours = json_decode($request->opening_hours, true) ?? [];
            $features = json_decode($request->features, true) ?? [];
            $awardsData = json_decode($request->awards, true) ?? [];

            // Create restaurant
            $restaurant = Restaurant::create([
                'name' => $request->name,
                'location' => $request->location,
                'description' => $request->description,
                'cuisine_type' => $request->cuisine_type,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'opening_hours' => $openingHours,
                'special_closure_days' => $request->special_closure_days ?? '',
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email ?? '',
                'website' => $request->website ?? '',
                'capacity' => $request->capacity ?? null,
                'features' => $features,
                'reservation_policy' => $request->reservation_policy ?? '',
                'has_daily_menu' => $request->has_daily_menu ?? false,
                'daily_menu_email' => $request->daily_menu_email ?? '',
                'main_image' => $mainImagePath,
                'gallery_images' => $galleryImagePaths,
                'menu_pdf' => $menuPdfPath,
                'owner_full_name' => $request->owner_full_name,
                'owner_bio' => $request->owner_bio,
                'owner_experience_years' => $request->owner_experience_years ?? null,
                'owner_specialties' => $request->owner_specialties ?? '',
                'owner_education' => $request->owner_education ?? '',
                'owner_image' => $ownerImagePath,
                'is_active' => true, // Default to active when created
            ]);

            // Handle awards
            if (!empty($awardsData)) {
                $awardImages = $request->file('award_images') ?? [];

                foreach ($awardsData as $index => $awardData) {
                    $awardImagePath = null;

                    // Upload award image if present
                    if (isset($awardImages[$index])) {
                        $awardImagePath = $awardImages[$index]->store('restaurants/awards', 'public');
                    }

                    $restaurant->awards()->create([
                        'title' => $awardData['title'] ?? '',
                        'description' => $awardData['description'] ?? null,
                        'year' => $awardData['year'] ?? '',
                        'image' => $awardImagePath,
                    ]);
                }
            }

            return redirect()->route('restaurants.manage')->with('success', 'Restaurant created successfully!');
        } catch (\Exception $e) {
            Log::error('Error creating restaurant: ' . $e->getMessage());

            // Clean up uploaded files if there's an error
            if (isset($mainImagePath)) Storage::disk('public')->delete($mainImagePath);
            if (isset($menuPdfPath)) Storage::disk('public')->delete($menuPdfPath);
            if (isset($ownerImagePath)) Storage::disk('public')->delete($ownerImagePath);
            foreach ($galleryImagePaths as $path) {
                Storage::disk('public')->delete($path);
            }

            return redirect()->back()->with('error', 'Error creating restaurant: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Display the specified resource (Web).
     */
    public function show(Restaurant $restaurant)
    {
        $restaurant->load('awards');

        return Inertia::render('Dashboard/Food/Restaurants/Manage/ShowRestaurant', [
            'restaurant' => $restaurant
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Restaurant $restaurant)
    {
        $restaurant->load('awards');

        return Inertia::render('Dashboard/Food/Restaurants/Manage/EditRestaurant', [
            'restaurant' => $restaurant
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Restaurant $restaurant)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'cuisine_type' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'contact_phone' => 'sometimes|required|string|max:20',
            'owner_full_name' => 'sometimes|required|string|max:255',
            'owner_bio' => 'sometimes|required|string',
            'main_image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'menu_pdf' => 'nullable|file|mimes:pdf|max:5120',
            'owner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'sometimes|json',
            'features' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        try {
            $updateData = $request->except(['main_image', 'gallery_images', 'menu_pdf', 'owner_image', 'awards']);

            // Handle file uploads
            if ($request->hasFile('main_image')) {
                // Delete old image
                if ($restaurant->main_image) {
                    Storage::disk('public')->delete($restaurant->main_image);
                }
                $updateData['main_image'] = $request->file('main_image')->store('restaurants/main', 'public');
            }

            if ($request->hasFile('owner_image')) {
                if ($restaurant->owner_image) {
                    Storage::disk('public')->delete($restaurant->owner_image);
                }
                $updateData['owner_image'] = $request->file('owner_image')->store('restaurants/owners', 'public');
            }

            if ($request->hasFile('menu_pdf')) {
                if ($restaurant->menu_pdf) {
                    Storage::disk('public')->delete($restaurant->menu_pdf);
                }
                $updateData['menu_pdf'] = $request->file('menu_pdf')->store('restaurants/menus', 'public');
            }

            // Handle gallery images
            if ($request->hasFile('gallery_images')) {
                // Delete old gallery images
                if ($restaurant->gallery_images) {
                    foreach ($restaurant->gallery_images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }

                $galleryImagePaths = [];
                foreach ($request->file('gallery_images') as $image) {
                    $galleryImagePaths[] = $image->store('restaurants/gallery', 'public');
                }
                $updateData['gallery_images'] = $galleryImagePaths;
            }

            // Parse JSON data
            if ($request->has('opening_hours')) {
                $updateData['opening_hours'] = json_decode($request->opening_hours, true) ?? [];
            }

            if ($request->has('features')) {
                $updateData['features'] = json_decode($request->features, true) ?? [];
            }

            $restaurant->update($updateData);

            // Handle awards updates if provided
            if ($request->has('awards')) {
                $awardsData = json_decode($request->awards, true) ?? [];
                $awardImages = $request->file('award_images') ?? [];

                // Update or create awards
                foreach ($awardsData as $index => $awardData) {
                    $awardImagePath = null;

                    // Handle award image upload
                    if (isset($awardImages[$index])) {
                        $awardImagePath = $awardImages[$index]->store('restaurants/awards', 'public');
                    }

                    if (isset($awardData['id'])) {
                        // Update existing award
                        $award = Award::find($awardData['id']);
                        if ($award && $award->restaurant_id === $restaurant->id) {
                            $award->update([
                                'title' => $awardData['title'] ?? '',
                                'description' => $awardData['description'] ?? null,
                                'year' => $awardData['year'] ?? '',
                                'image' => $awardImagePath ?: $award->image,
                            ]);
                        }
                    } else {
                        // Create new award
                        $restaurant->awards()->create([
                            'title' => $awardData['title'] ?? '',
                            'description' => $awardData['description'] ?? null,
                            'year' => $awardData['year'] ?? '',
                            'image' => $awardImagePath,
                        ]);
                    }
                }
            }

            return redirect()->route('restaurants.manage')->with('success', 'Restaurant updated successfully!');
        } catch (\Exception $e) {
            Log::error('Error updating restaurant: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error updating restaurant: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Restaurant $restaurant)
    {
        try {
            // Delete associated files
            if ($restaurant->main_image) {
                Storage::disk('public')->delete($restaurant->main_image);
            }
            if ($restaurant->menu_pdf) {
                Storage::disk('public')->delete($restaurant->menu_pdf);
            }
            if ($restaurant->owner_image) {
                Storage::disk('public')->delete($restaurant->owner_image);
            }
            if ($restaurant->gallery_images) {
                foreach ($restaurant->gallery_images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            // Delete awards and their images
            foreach ($restaurant->awards as $award) {
                if ($award->image) {
                    Storage::disk('public')->delete($award->image);
                }
                $award->delete();
            }

            $restaurant->delete();

            return redirect()->route('restaurants.manage')->with('success', 'Restaurant deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting restaurant: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error deleting restaurant: ' . $e->getMessage());
        }
    }

    /**
     * Update restaurant status
     */
    public function updateStatus(Request $request, Restaurant $restaurant)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $restaurant->update(['is_active' => $request->is_active]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Restaurant status updated successfully',
                'is_active' => $restaurant->is_active
            ]);
        }

        return redirect()->back()->with('success', 'Restaurant status updated successfully');
    }

    /**
     * Bulk update restaurant status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'restaurant_ids' => 'required|array',
            'restaurant_ids.*' => 'exists:restaurants,id',
            'is_active' => 'required|boolean'
        ]);

        Restaurant::whereIn('id', $request->restaurant_ids)
            ->update(['is_active' => $request->is_active]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Restaurants status updated successfully',
                'updated_count' => count($request->restaurant_ids)
            ]);
        }

        return redirect()->back()->with('success', 'Restaurants status updated successfully');
    }

    /**
     * Bulk delete restaurants
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'restaurant_ids' => 'required|array',
            'restaurant_ids.*' => 'exists:restaurants,id'
        ]);

        $restaurants = Restaurant::whereIn('id', $request->restaurant_ids)->get();

        foreach ($restaurants as $restaurant) {
            // Delete associated files
            if ($restaurant->main_image) Storage::disk('public')->delete($restaurant->main_image);
            if ($restaurant->menu_pdf) Storage::disk('public')->delete($restaurant->menu_pdf);
            if ($restaurant->owner_image) Storage::disk('public')->delete($restaurant->owner_image);
            if ($restaurant->gallery_images) {
                foreach ($restaurant->gallery_images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            // Delete awards
            foreach ($restaurant->awards as $award) {
                if ($award->image) Storage::disk('public')->delete($award->image);
                $award->delete();
            }

            $restaurant->delete();
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Restaurants deleted successfully',
                'deleted_count' => count($request->restaurant_ids)
            ]);
        }

        return redirect()->back()->with('success', 'Restaurants deleted successfully');
    }

    /**
     * Show restaurant management page
     */
    public function manage(Request $request)
    {
        $restaurants = Restaurant::withCount('awards')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('cuisine_type', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard/Food/Restaurants/Manage/RestaurantsManage', [
            'restaurants' => $restaurants,
            'filters' => $request->only(['search', 'status']),
        ]);
    }
}
