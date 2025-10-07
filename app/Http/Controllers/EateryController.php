<?php

namespace App\Http\Controllers;

use App\Models\Eatery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EateryController extends Controller
{
    public function index()
    {
        $eateries = Eatery::latest()->paginate(10);
        return inertia('Dashboard/Food/Eateries/Index', compact('eateries'));
    }

    public function create()
    {
        return inertia('Dashboard/Food/Eateries/Add/Eateries');
    }

    public function store(Request $request)
    {
        // Debug: Log the incoming request data
        Log::info('Eatery Store Request:', $request->all());
        Log::info('Files:', $request->file() ? array_keys($request->file()) : ['no files']);

        // Validate the request - FIXED for Inertia file upload format
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:500',
            'description' => 'required|string|min:10',
            'eatery_type' => 'required|string|max:255',
            'cuisine_type' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',

            // Opening hours is sent as JSON string from React
            'opening_hours' => 'required|json',

            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'capacity' => 'nullable|integer|min:1',
            'reservation_policy' => 'nullable|string|max:1000',
            'price_range' => 'nullable|string|max:255',
            'service_type' => 'nullable|string|max:255',

            // Daily specials
            'has_daily_specials' => 'boolean',
            'daily_specials_email' => 'nullable|required_if:has_daily_specials,true|email|max:255',

            // Images validation - FIXED: Inertia sends files differently
            'main_image' => 'required|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'menu_pdf' => 'nullable|file|mimes:pdf|max:10240',

            // Owner information
            'owner_full_name' => 'required|string|max:255',
            'owner_bio' => 'required|string|min:10|max:2000',
            'owner_experience_years' => 'nullable|integer|min:0|max:100',
            'owner_specialties' => 'nullable|string|max:1000',
            'owner_education' => 'nullable|string|max:255',
            'owner_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',

            // Awards is sent as JSON string from React
            'awards' => 'nullable|json',
            'features' => 'nullable|json', // Added missing features field
            'special_closure_days' => 'nullable|json', // Added special closure days
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // Handle file uploads - FIXED for Inertia file handling
            $mainImagePath = null;
            if ($request->hasFile('main_image')) {
                $mainImagePath = $this->uploadFile($request->file('main_image'), 'eateries/main');
            }

            $ownerImagePath = null;
            if ($request->hasFile('owner_image')) {
                $ownerImagePath = $this->uploadFile($request->file('owner_image'), 'eateries/owners');
            }

            $menuPdfPath = null;
            if ($request->hasFile('menu_pdf')) {
                $menuPdfPath = $this->uploadFile($request->file('menu_pdf'), 'eateries/menus');
            }

            // Handle gallery images - FIXED: Inertia handles array files differently
            $galleryPaths = [];
            if ($request->hasFile('gallery_images')) {
                // Inertia sends gallery_images as an array of files
                foreach ($request->file('gallery_images') as $image) {
                    if ($image && $image->isValid()) {
                        $galleryPaths[] = $this->uploadFile($image, 'eateries/gallery');
                    }
                }
            }

            // Handle award images - FIXED: Award images come as separate files
            $awardsData = json_decode($request->awards, true) ?? [];
            $processedAwards = [];

            if (!empty($awardsData)) {
                foreach ($awardsData as $index => $award) {
                    $awardImagePath = null;
                    // Award images are sent as separate files with index keys
                    if ($request->hasFile("award_images.{$index}")) {
                        $awardImagePath = $this->uploadFile(
                            $request->file("award_images.{$index}"),
                            'eateries/awards'
                        );
                    }

                    $processedAwards[] = [
                        'id' => $award['id'] ?? Str::uuid(),
                        'title' => $award['title'] ?? '',
                        'description' => $award['description'] ?? '',
                        'year' => $award['year'] ?? '',
                        'image_path' => $awardImagePath,
                    ];
                }
            }

            // Parse features from JSON to array
            $featuresArray = [];
            if ($request->features) {
                $featuresArray = json_decode($request->features, true) ?? [];
            }

            // Parse special closure days from JSON to array
            $specialClosureDays = [];
            if ($request->special_closure_days) {
                $specialClosureDays = json_decode($request->special_closure_days, true) ?? [];
            }

            // Create eatery - FIXED: Use correct field names and handle JSON properly
            $eatery = Eatery::create([
                'name' => $request->name,
                'location' => $request->location,
                'description' => $request->description,
                'eatery_type' => $request->eatery_type,
                'cuisine_type' => $request->cuisine_type,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'opening_hours' => json_decode($request->opening_hours, true), // Decode JSON to array
                'special_closure_days' => $specialClosureDays,
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email,
                'website' => $request->website,
                'capacity' => $request->capacity ? (int)$request->capacity : null,
                'features' => $featuresArray, // Use parsed array
                'reservation_policy' => $request->reservation_policy,
                'price_range' => $request->price_range,
                'service_type' => $request->service_type,
                'has_daily_specials' => $request->has_daily_specials ?? false,
                'daily_specials_email' => $request->daily_specials_email,
                'main_image' => $mainImagePath,
                'gallery_images' => $galleryPaths,
                'menu_pdf' => $menuPdfPath,
                'owner_full_name' => $request->owner_full_name,
                'owner_bio' => $request->owner_bio,
                'owner_experience_years' => $request->owner_experience_years ? (int)$request->owner_experience_years : null,
                'owner_specialties' => $request->owner_specialties,
                'owner_education' => $request->owner_education,
                'owner_image' => $ownerImagePath,
                'awards' => $processedAwards,
                'status' => 'pending',
            ]);

            Log::info('Eatery created successfully:', ['id' => $eatery->id, 'name' => $eatery->name]);

            return redirect()->route('eateries.add')
                ->with('success', 'Eatery created successfully! It will be reviewed before publishing.');
        } catch (\Exception $e) {
            Log::error('Error creating eatery:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Error creating eatery: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Eatery $eatery)
    {
        return inertia('Dashboard/Food/Eateries/Show', compact('eatery'));
    }

    // NEW: Public detailed view for main website
    public function detailed($id)
    {
        $eatery = Eatery::with(['dailyMenus' => function ($query) {
            $query->where('status', 'active')
                ->orderBy('menu_date', 'desc')
                ->limit(7);
        }])->where('status', 'approved')->findOrFail($id);

        // Prepare eatery data with comprehensive status information
        $eateryData = [
            'id' => $eatery->id,
            'name' => $eatery->name,
            'location' => $eatery->location,
            'description' => $eatery->description,
            'price_range' => $eatery->price_range,
            'main_image' => $eatery->main_image,
            'cuisine_type' => $eatery->cuisine_type,
            'eatery_type' => $eatery->eatery_type,
            'capacity' => $eatery->capacity,
            'opening_hours' => $eatery->opening_hours,
            'contact_phone' => $eatery->contact_phone,
            'contact_email' => $eatery->contact_email,
            'is_open' => $eatery->isOpen(),
            'current_status' => $eatery->current_status, // Enhanced status information
            'today_hours' => $eatery->today_hours, // Today's hours in readable format
            'daily_menus' => $eatery->dailyMenus,
        ];

        return Inertia::render('Main/Eatery/EateryDetailed', [
            'eatery' => $eateryData,
        ]);
    }

    // NEW: Booking page for main website
    public function booking($id)
    {
        $eatery = Eatery::where('status', 'approved')->findOrFail($id);

        // Prepare eatery data with comprehensive status information
        $eateryData = [
            'id' => $eatery->id,
            'name' => $eatery->name,
            'location' => $eatery->location,
            'description' => $eatery->description,
            'price_range' => $eatery->price_range,
            'main_image' => $eatery->main_image,
            'cuisine_type' => $eatery->cuisine_type,
            'eatery_type' => $eatery->eatery_type,
            'capacity' => $eatery->capacity,
            'opening_hours' => $eatery->opening_hours,
            'contact_phone' => $eatery->contact_phone,
            'contact_email' => $eatery->contact_email,
            'is_open' => $eatery->isOpen(), // Real-time open status
            'current_status' => $eatery->current_status, // Enhanced status information
            'today_hours' => $eatery->today_hours, // Today's hours in readable format
        ];

        return Inertia::render('Main/Eatery/EateryBooking', [
            'eatery' => $eateryData,
        ]);
    }

    // NEW: Public eateries listing for main website
    public function publicIndex()
    {
        $eateries = Eatery::where('status', 'approved')
            ->withCount('dailyMenus')
            ->latest()
            ->paginate(12);

        // Enhance each eatery with real-time open status
        $eateries->getCollection()->transform(function ($eatery) {
            return [
                'id' => $eatery->id,
                'name' => $eatery->name,
                'location' => $eatery->location,
                'description' => $eatery->description,
                'price_range' => $eatery->price_range,
                'main_image' => $eatery->main_image,
                'cuisine_type' => $eatery->cuisine_type,
                'eatery_type' => $eatery->eatery_type,
                'is_open' => $eatery->isOpen(),
                'current_status' => $eatery->current_status,
                'today_hours' => $eatery->today_hours,
                'daily_menus_count' => $eatery->daily_menus_count,
            ];
        });

        return Inertia::render('Main/Eatery/Index', [
            'eateries' => $eateries,
        ]);
    }

    public function edit(Eatery $eatery)
    {
        return inertia('Dashboard/Food/Eateries/Edit', compact('eatery'));
    }

    public function update(Request $request, Eatery $eatery)
    {
        // Validation rules for update (some fields are optional)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:500',
            'description' => 'required|string|min:10',
            'eatery_type' => 'required|string|max:255',
            'cuisine_type' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'opening_hours' => 'required|json',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'main_image' => 'sometimes|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'sometimes|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'menu_pdf' => 'nullable|file|mimes:pdf|max:10240',
            'owner_full_name' => 'required|string|max:255',
            'owner_bio' => 'required|string|min:10|max:2000',
            'owner_experience_years' => 'nullable|integer|min:0|max:100',
            'owner_specialties' => 'nullable|string|max:1000',
            'owner_education' => 'nullable|string|max:255',
            'owner_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'awards' => 'nullable|json',
            'features' => 'nullable|json',
            'special_closure_days' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // Handle file updates
            $updateData = [
                'name' => $request->name,
                'location' => $request->location,
                'description' => $request->description,
                'eatery_type' => $request->eatery_type,
                'cuisine_type' => $request->cuisine_type,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'opening_hours' => json_decode($request->opening_hours, true),
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email,
                'website' => $request->website,
                'capacity' => $request->capacity ? (int)$request->capacity : null,
                'reservation_policy' => $request->reservation_policy,
                'price_range' => $request->price_range,
                'service_type' => $request->service_type,
                'has_daily_specials' => $request->has_daily_specials ?? false,
                'daily_specials_email' => $request->daily_specials_email,
                'owner_full_name' => $request->owner_full_name,
                'owner_bio' => $request->owner_bio,
                'owner_experience_years' => $request->owner_experience_years ? (int)$request->owner_experience_years : null,
                'owner_specialties' => $request->owner_specialties,
                'owner_education' => $request->owner_education,
            ];

            // Parse features if provided
            if ($request->features) {
                $updateData['features'] = json_decode($request->features, true) ?? [];
            }

            // Parse special closure days if provided
            if ($request->special_closure_days) {
                $updateData['special_closure_days'] = json_decode($request->special_closure_days, true) ?? [];
            }

            // Handle main image update
            if ($request->hasFile('main_image')) {
                // Delete old main image
                if ($eatery->main_image) {
                    Storage::disk('public')->delete($eatery->main_image);
                }
                $updateData['main_image'] = $this->uploadFile($request->file('main_image'), 'eateries/main');
            }

            // Handle owner image update
            if ($request->hasFile('owner_image')) {
                // Delete old owner image
                if ($eatery->owner_image) {
                    Storage::disk('public')->delete($eatery->owner_image);
                }
                $updateData['owner_image'] = $this->uploadFile($request->file('owner_image'), 'eateries/owners');
            }

            // Handle menu PDF update
            if ($request->hasFile('menu_pdf')) {
                // Delete old menu PDF
                if ($eatery->menu_pdf) {
                    Storage::disk('public')->delete($eatery->menu_pdf);
                }
                $updateData['menu_pdf'] = $this->uploadFile($request->file('menu_pdf'), 'eateries/menus');
            }

            // Handle gallery images update
            if ($request->hasFile('gallery_images')) {
                $galleryPaths = [];
                foreach ($request->file('gallery_images') as $image) {
                    if ($image && $image->isValid()) {
                        $galleryPaths[] = $this->uploadFile($image, 'eateries/gallery');
                    }
                }
                // Merge with existing gallery images or replace completely?
                $existingGallery = $eatery->gallery_images ?? [];
                $updateData['gallery_images'] = array_merge($existingGallery, $galleryPaths);
            }

            // Handle awards update
            if ($request->awards) {
                $awardsData = json_decode($request->awards, true) ?? [];
                $processedAwards = [];

                foreach ($awardsData as $index => $award) {
                    $awardImagePath = $award['image_path'] ?? null;

                    // Handle new award image upload
                    if ($request->hasFile("award_images.{$index}")) {
                        $awardImagePath = $this->uploadFile(
                            $request->file("award_images.{$index}"),
                            'eateries/awards'
                        );
                    }

                    $processedAwards[] = [
                        'id' => $award['id'] ?? Str::uuid(),
                        'title' => $award['title'] ?? '',
                        'description' => $award['description'] ?? '',
                        'year' => $award['year'] ?? '',
                        'image_path' => $awardImagePath,
                    ];
                }
                $updateData['awards'] = $processedAwards;
            }

            $eatery->update($updateData);

            return redirect()->route('eateries.index')
                ->with('success', 'Eatery updated successfully!');
        } catch (\Exception $e) {
            Log::error('Error updating eatery:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Error updating eatery: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Eatery $eatery)
    {
        try {
            // Delete associated files
            if ($eatery->main_image) {
                Storage::disk('public')->delete($eatery->main_image);
            }

            if ($eatery->owner_image) {
                Storage::disk('public')->delete($eatery->owner_image);
            }

            if ($eatery->menu_pdf) {
                Storage::disk('public')->delete($eatery->menu_pdf);
            }

            // Delete gallery images
            if ($eatery->gallery_images) {
                foreach ($eatery->gallery_images as $image) {
                    if ($image) {
                        Storage::disk('public')->delete($image);
                    }
                }
            }

            // Delete award images
            if ($eatery->awards) {
                foreach ($eatery->awards as $award) {
                    if (isset($award['image_path']) && $award['image_path']) {
                        Storage::disk('public')->delete($award['image_path']);
                    }
                }
            }

            $eatery->delete();

            return redirect()->route('eateries.index')
                ->with('success', 'Eatery deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting eatery:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Error deleting eatery: ' . $e->getMessage());
        }
    }

    public function updateStatus(Eatery $eatery, Request $request)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected'
        ]);

        $eatery->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'Eatery status updated successfully!');
    }

    /**
     * Check real-time status of an eatery (API endpoint)
     */
    public function checkStatus($id)
    {
        $eatery = Eatery::where('status', 'approved')->findOrFail($id);

        return response()->json([
            'is_open' => $eatery->isOpen(),
            'current_status' => $eatery->current_status,
            'today_hours' => $eatery->today_hours,
            'updated_at' => now()->toISOString(),
        ]);
    }

    private function uploadFile($file, $directory)
    {
        if (!$file || !$file->isValid()) {
            return null;
        }

        $extension = $file->getClientOriginalExtension();
        $fileName = Str::random(40) . '.' . $extension;

        // Store file in public disk
        $path = $file->storeAs($directory, $fileName, 'public');

        Log::info('File uploaded:', ['path' => $path, 'directory' => $directory]);

        return $path;
    }
    // Add this method to your EateryController
    public function search(Request $request)
    {
        $query = Eatery::where('status', 'approved');

        // Search by name or location
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('location', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by cuisine type
        if ($request->has('cuisine_type') && $request->cuisine_type && $request->cuisine_type !== 'All Cuisines') {
            $query->where('cuisine_type', $request->cuisine_type);
        }

        // Filter by price range
        if ($request->has('price_range') && $request->price_range && $request->price_range !== 'All Prices') {
            $query->where('price_range', $request->price_range);
        }

        // Filter by eatery type
        if ($request->has('eatery_type') && $request->eatery_type && $request->eatery_type !== 'All Types') {
            $query->where('eatery_type', $request->eatery_type);
        }

        $eateries = $query->get([
            'id',
            'name',
            'main_image',
            'location',
            'cuisine_type',
            'price_range',
            'eatery_type',
            'description',
            'opening_hours',
            'contact_phone',
            'features'
        ]);

        // Add real-time status to each eatery
        $eateries->transform(function ($eatery) {
            return [
                'id' => $eatery->id,
                'name' => $eatery->name,
                'main_image' => $eatery->main_image,
                'location' => $eatery->location,
                'cuisine_type' => $eatery->cuisine_type,
                'price_range' => $eatery->price_range,
                'eatery_type' => $eatery->eatery_type,
                'description' => $eatery->description,
                'is_open' => $eatery->isOpen(),
                'current_status' => $eatery->current_status,
                'today_hours' => $eatery->today_hours,
                'features' => $eatery->features ?? [],
                'rating' => 4.5, // You can add actual ratings if you have them
                'status' => $eatery->isOpen() ? 'open' : 'closed'
            ];
        });

        return response()->json($eateries);
    }
    // Add this method to your EateryController for the API endpoint
    public function apiIndex(Request $request)
    {
        $eateries = Eatery::where('status', 'approved')
            ->select('id', 'name', 'main_image', 'location', 'cuisine_type', 'price_range')
            ->latest()
            ->get();

        return response()->json([
            'data' => $eateries,
            'message' => 'Eateries retrieved successfully'
        ]);
    }
}
