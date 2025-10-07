<?php

namespace App\Http\Controllers;

use App\Models\SwimmingPool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SwimmingPoolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SwimmingPool::query();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('location', 'like', '%' . $request->search . '%');
        }

        $pools = $query->paginate(10);

        return response()->json($pools);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/Entertainment/Pool/Add/SwimmingPools');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'pool_type' => 'required|string',
            'water_type' => 'required|string',
            'facilities' => 'required|string',
            'price' => 'required|string',
            'main_image' => 'required|image|max:2048',
            'gallery_images.*' => 'image|max:2048',
            'opening_hours' => 'required|json',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Handle main image upload
        $mainImagePath = $request->file('main_image')->store('swimming-pools', 'public');

        // Handle gallery images upload
        $galleryImagesPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryImagesPaths[] = $image->store('swimming-pools/gallery', 'public');
            }
        }

        $pool = SwimmingPool::create([
            'name' => $request->name,
            'description' => $request->description,
            'location' => $request->location,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'pool_type' => $request->pool_type,
            'water_type' => $request->water_type,
            'facilities' => $request->facilities,
            'price' => $request->price,
            'main_image' => $mainImagePath,
            'gallery_images' => $galleryImagesPaths,
            'opening_hours' => json_decode($request->opening_hours, true),
        ]);

        return redirect()->route('swimming-pools.manage')
            ->with('success', 'Swimming pool created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SwimmingPool $swimmingPool)
    {
        return response()->json($swimmingPool);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SwimmingPool $swimmingPool)
    {
        return Inertia::render('Dashboard/Entertainment/Pool/Manage/EditPool', [
            'pool' => $swimmingPool,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    // In the update method of SwimmingPoolController
    public function update(Request $request, SwimmingPool $swimmingPool)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'pool_type' => 'required|string',
            'water_type' => 'required|string',
            'facilities' => 'required|string',
            'price' => 'required|string',
            'status' => 'required|in:active,inactive',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'opening_hours' => 'required|json',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $request->except(['main_image', 'gallery_images']);

        // Handle main image upload if provided
        if ($request->hasFile('main_image')) {
            // Delete old main image
            if ($swimmingPool->main_image) {
                Storage::disk('public')->delete($swimmingPool->main_image);
            }

            // Store new main image
            $data['main_image'] = $request->file('main_image')->store('swimming-pools', 'public');
        }

        // Handle gallery images
        if ($request->has('existing_gallery_images')) {
            $existingImages = json_decode($request->existing_gallery_images, true);

            // Delete removed images
            if ($swimmingPool->gallery_images) {
                foreach ($swimmingPool->gallery_images as $oldImage) {
                    if (!in_array($oldImage, $existingImages)) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
            }

            $data['gallery_images'] = $existingImages;
        }

        // Handle new gallery images upload if provided
        if ($request->hasFile('gallery_images')) {
            $galleryImagesPaths = $data['gallery_images'] ?? [];

            foreach ($request->file('gallery_images') as $image) {
                $galleryImagesPaths[] = $image->store('swimming-pools/gallery', 'public');
            }
            $data['gallery_images'] = $galleryImagesPaths;
        }

        // Decode opening_hours JSON
        if ($request->has('opening_hours')) {
            $data['opening_hours'] = json_decode($request->opening_hours, true);
        }

        $swimmingPool->update($data);

        return redirect()->route('swimming-pools.manage')
            ->with('success', 'Swimming pool updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SwimmingPool $swimmingPool)
    {
        // Delete main image
        if ($swimmingPool->main_image) {
            Storage::disk('public')->delete($swimmingPool->main_image);
        }

        // Delete gallery images
        if ($swimmingPool->gallery_images) {
            foreach ($swimmingPool->gallery_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $swimmingPool->delete();

        if (request()->expectsJson()) {
            return response()->json(['success' => 'Swimming pool deleted successfully.']);
        }

        return redirect()->route('swimming-pools.manage')
            ->with('success', 'Swimming pool deleted successfully.');
    }
}
