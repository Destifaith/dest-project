<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class GymController extends Controller
{
    public function create()
    {
        return Inertia::render('Dashboard/Entertainment/Gym/AddGym');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string',
            'name' => 'required|string',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'equipment_type' => 'required|string',
            'gym_type' => 'required|string',
            'facilities' => 'required|string',
            'price' => 'required|string',
            'main_image' => 'required|image|max:2048',
            'gallery_images.*' => 'image|max:2048',
            'opening_hours' => 'required|json',
        ]);

        // Handle main image upload
        $mainImagePath = $request->file('main_image')->store('gyms/main', 'public');

        // Handle gallery images
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryPaths[] = $image->store('gyms/gallery', 'public');
            }
        }

        // Create the gym record
        Gym::create([
            'location' => $validated['location'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'equipment_type' => $validated['equipment_type'],
            'gym_type' => $validated['gym_type'],
            'facilities' => $validated['facilities'],
            'price' => $validated['price'],
            'main_image' => $mainImagePath,
            'gallery_images' => json_encode($galleryPaths),
            'opening_hours' => $validated['opening_hours'],
            'is_active' => true,
        ]);

        return redirect('/dashboard/entertainment/gym/manage')->with('success', 'Gym added successfully!');
    }

    public function manage()
    {
        $gyms = Gym::all();
        return Inertia::render('Dashboard/Entertainment/Gym/ManageGyms', [
            'gyms' => $gyms
        ]);
    }

    public function destroy(Gym $gym)
    {
        // Delete associated images from storage
        if ($gym->main_image) {
            Storage::disk('public')->delete($gym->main_image);
        }
        if ($gym->gallery_images) {
            $galleryImages = json_decode($gym->gallery_images, true);
            if (is_array($galleryImages)) {
                foreach ($galleryImages as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
        }
        $gym->delete();
        return redirect()->route('gyms.manage')->with('success', 'Gym deleted successfully!');
    }

    public function update(Request $request, Gym $gym)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'equipment_type' => 'nullable|string',
            'gym_type' => 'nullable|string',
            'facilities' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'price' => 'nullable|string',
            'main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'required|json',
        ]);

        if ($request->hasFile('main_image')) {
            // Delete old main image
            if ($gym->main_image) {
                Storage::disk('public')->delete($gym->main_image);
            }
            $validated['main_image'] = $request->file('main_image')->store('gyms/main', 'public');
        }

        if ($request->hasFile('gallery_images')) {
            // Delete old gallery images
            if ($gym->gallery_images) {
                $oldGalleryImages = json_decode($gym->gallery_images, true);
                if (is_array($oldGalleryImages)) {
                    foreach ($oldGalleryImages as $image) {
                        Storage::disk('public')->delete($image);
                    }
                }
            }

            // Upload new gallery images
            $galleryImages = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('gyms/gallery', 'public');
            }
            $validated['gallery_images'] = json_encode($galleryImages);
        }

        // Convert status to is_active
        $validated['is_active'] = $validated['status'] === 'active';
        unset($validated['status']);

        $gym->update($validated);

        return redirect()->route('gyms.manage')->with('success', 'Gym updated successfully.');
    }

    /**
     * Display a listing of the resource for API
     */
    public function index()
    {
        try {
            $gyms = Gym::where('is_active', true)->get();
            return response()->json($gyms);
        } catch (\Exception $e) {
            Log::error('Gym index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch gyms'], 500);
        }
    }

    /**
     * Display a listing of the resource for frontend (Inertia)
     */
    public function frontendIndex()
    {
        $gyms = Gym::where('is_active', true)
            ->latest()
            ->get();

        return Inertia::render('Main/Gyms/Page', [
            'gyms' => $gyms
        ]);
    }

    /**
     * Display single gym for frontend (Inertia) - UPDATED
     */
    public function frontendShow(Gym $gym)
    {
        if (!$gym->is_active) {
            abort(404);
        }

        // Parse gallery images if they exist
        $galleryImages = [];
        if ($gym->gallery_images) {
            try {
                $galleryImages = json_decode($gym->gallery_images, true);
                if (!is_array($galleryImages)) {
                    $galleryImages = [];
                }
            } catch (\Exception $e) {
                $galleryImages = [];
            }
        }

        // Parse opening hours if they exist
        $openingHours = [];
        if ($gym->opening_hours) {
            try {
                $openingHours = json_decode($gym->opening_hours, true);
                if (!is_array($openingHours)) {
                    $openingHours = [];
                }
            } catch (\Exception $e) {
                $openingHours = [];
            }
        }

        // Parse facilities if they exist
        $facilities = [];
        if ($gym->facilities) {
            try {
                // If facilities is stored as JSON string
                $facilities = json_decode($gym->facilities, true);
                if (!is_array($facilities)) {
                    // If it's a comma-separated string
                    $facilities = array_map('trim', explode(',', $gym->facilities));
                }
            } catch (\Exception $e) {
                // Fallback to comma-separated parsing
                $facilities = array_map('trim', explode(',', $gym->facilities));
            }
        }

        // Prepare the gym data for the frontend
        $gymData = [
            'id' => $gym->id,
            'name' => $gym->name,
            'location' => $gym->location,
            'description' => $gym->description,
            'gym_type' => $gym->gym_type,
            'equipment_type' => $gym->equipment_type,
            'category' => $gym->category,
            'price' => $gym->price,
            'latitude' => $gym->latitude,
            'longitude' => $gym->longitude,
            'main_image' => $gym->main_image,
            'gallery_images' => $galleryImages,
            'opening_hours' => $openingHours,
            'contact_phone' => $gym->contact_phone,
            'contact_email' => $gym->contact_email,
            'website' => $gym->website,
            'facilities' => $facilities,
            'capacity' => $gym->capacity,
            'established_year' => $gym->established_year,
            'is_24_7' => $gym->is_24_7,
            'has_personal_training' => $gym->has_personal_training,
            'has_group_classes' => $gym->has_group_classes,
            'has_pool' => $gym->has_pool,
            'has_sauna' => $gym->has_sauna,
            'has_childcare' => $gym->has_childcare,
            'trainers' => $gym->trainers ?? [],
            'classes' => $gym->classes ?? [],
            'membership_options' => $gym->membership_options ?? [],
            'awards' => $gym->awards ?? [],
        ];

        return Inertia::render('Main/Gyms/GymsDetailed', [
            'gym' => $gymData
        ]);
    }

    /**
     * Edit form for gym
     */
    public function edit(Gym $gym)
    {
        return Inertia::render('Dashboard/Entertainment/Gym/EditGym', [
            'gym' => $gym
        ]);
    }

    /**
     * Show gym details in dashboard
     */
    public function show(Gym $gym)
    {
        return Inertia::render('Dashboard/Entertainment/Gym/ShowGym', [
            'gym' => $gym
        ]);
    }

    /**
     * API endpoint for gym search/filter
     */
    public function search(Request $request)
    {
        try {
            $query = Gym::where('is_active', true);

            // Search across multiple fields
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('location', 'like', "%{$searchTerm}%")
                        ->orWhere('equipment_type', 'like', "%{$searchTerm}%")
                        ->orWhere('gym_type', 'like', "%{$searchTerm}%")
                        ->orWhere('facilities', 'like', "%{$searchTerm}%")
                        ->orWhere('price', 'like', "%{$searchTerm}%");
                });
            }

            // Filter by gym type (only if not "All Types")
            if ($request->has('gym_type') && !empty($request->gym_type) && $request->gym_type !== 'All Types') {
                $query->where('gym_type', 'like', "%{$request->gym_type}%");
            }

            // Filter by price (only if not "All Prices")
            if ($request->has('price') && !empty($request->price) && $request->price !== 'All Prices') {
                $query->where('price', 'like', "%{$request->price}%");
            }

            // Filter by equipment type (only if not "All Equipment")
            if ($request->has('equipment_type') && !empty($request->equipment_type) && $request->equipment_type !== 'All Equipment') {
                $query->where('equipment_type', 'like', "%{$request->equipment_type}%");
            }

            $gyms = $query->get();

            Log::info('Gym search completed', [
                'search_term' => $request->search,
                'gym_type' => $request->gym_type,
                'price' => $request->price,
                'equipment_type' => $request->equipment_type,
                'results_count' => $gyms->count()
            ]);

            return response()->json($gyms);
        } catch (\Exception $e) {
            Log::error('Gym search error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to search gyms',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test API endpoint
     */
    public function test()
    {
        try {
            $gymCount = Gym::where('is_active', true)->count();

            return response()->json([
                'message' => 'Gym API is working!',
                'gym_count' => $gymCount,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Gym test endpoint error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Test failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all gyms for client-side filtering (fallback)
     */
    public function getAllGyms()
    {
        try {
            $gyms = Gym::where('is_active', true)->get();
            return response()->json($gyms);
        } catch (\Exception $e) {
            Log::error('Get all gyms error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch gyms'], 500);
        }
    }

    /**
     * Get gyms by category
     */
    public function getGymsByCategory(Request $request, $category)
    {
        try {
            $categoryMap = [
                'strength' => ['Powerlifting', 'Bodybuilding', 'Strength Training'],
                'cardio' => ['Commercial', 'Cardio Focus'],
                'yoga' => ['Yoga Studio', 'Boutique'],
                'crossfit' => ['CrossFit', 'Functional Training'],
                'premium' => ['Commercial', 'Boutique'],
                '24_7' => ['24/7 Access', '24/7 Gym'],
                'women_only' => ['Women Only'],
                'functional' => ['Functional Training', 'CrossFit']
            ];

            if (!array_key_exists($category, $categoryMap)) {
                return response()->json(['error' => 'Category not found'], 404);
            }

            $gymTypes = $categoryMap[$category];

            $gyms = Gym::where('is_active', true)
                ->where(function ($query) use ($gymTypes) {
                    foreach ($gymTypes as $type) {
                        $query->orWhere('gym_type', 'like', "%{$type}%");
                    }
                })
                ->latest()
                ->get();

            return response()->json([
                'category' => $category,
                'gyms' => $gyms,
                'count' => $gyms->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Gym category error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch gyms by category'], 500);
        }
    }
    /**
     * Show gym booking form
     */
    public function booking(Request $request)
    {
        $gymId = $request->query('id');

        if (!$gymId) {
            return redirect()->route('gyms.frontend.index')->with('error', 'No gym selected.');
        }

        $gym = Gym::where('is_active', true)->find($gymId);

        if (!$gym) {
            return redirect()->route('gyms.frontend.index')->with('error', 'Gym not found or inactive.');
        }

        return Inertia::render('Main/Gyms/GymBooking', [
            'gym' => $gym
        ]);
    }
}
