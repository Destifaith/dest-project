<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Beach;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BeachController extends Controller
{
    // Fetch all beaches (API)
    public function index()
    {
        return Beach::with(['mainImage', 'galleryImages'])->get();
    }

    // Store a new beach
    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'sand_type' => 'nullable|string',
            'water_type' => 'nullable|string',
            'facilities' => 'nullable|array',
            'facilities.*' => 'string',
            'is_public' => 'boolean',
            'main_image' => 'nullable|image|max:5120', // 5MB max
            'gallery_images.*' => 'nullable|image|max:5120',
        ]);

        $beach = Beach::create($validated);

        // Handle main image upload
        if ($request->hasFile('main_image')) {
            $path = $request->file('main_image')->store('beaches', 'public');
            $beach->images()->create([
                'image_path' => $path,
                'type' => 'main',
            ]);
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('beaches', 'public');
                $beach->images()->create([
                    'image_path' => $path,
                    'type' => 'gallery',
                ]);
            }
        }

        return redirect()->route('beaches.add')->with('success', 'Beach created successfully!');
    }

    // Show a single beach (View page)
    public function show(Beach $beach)
    {
        $beach->load(['mainImage', 'galleryImages']);

        return Inertia::render('Dashboard/Entertainment/Beaches/Manage/ViewBeach', [
            'beach' => $beach,
        ]);
    }

    // Edit a beach page
    public function edit(Beach $beach)
    {
        $beach->load(['mainImage', 'galleryImages']);

        return Inertia::render('Dashboard/Entertainment/Beaches/Manage/EditBeach', [
            'beach' => $beach,
        ]);
    }

    // Update a beach (partial update supported)
    public function update(Request $request, Beach $beach)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location' => 'nullable|string',
            'sand_type' => 'nullable|string',
            'water_type' => 'nullable|string',
            'facilities' => 'nullable|array',
            'facilities.*' => 'string',
            'is_public' => 'boolean',
            'main_image' => 'nullable|image|max:5120',
            'gallery_images.*' => 'nullable|image|max:5120',
        ]);

        // Update only fields that are present
        $beach->update($validated);

        // Handle main image update
        if ($request->hasFile('main_image')) {
            if ($beach->mainImage) {
                Storage::disk('public')->delete($beach->mainImage->image_path);
                $beach->mainImage->delete();
            }
            $path = $request->file('main_image')->store('beaches', 'public');
            $beach->images()->create([
                'image_path' => $path,
                'type' => 'main',
            ]);
        }

        // Handle gallery images update
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('beaches', 'public');
                $beach->images()->create([
                    'image_path' => $path,
                    'type' => 'gallery',
                ]);
            }
        }

        // Redirect to the View page
        return redirect()->route('beaches.show', $beach->id)
            ->with('success', 'Beach updated successfully!');
    }

    // Delete a beach
    public function destroy(Beach $beach)
    {
        // Delete images from storage
        foreach ($beach->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $beach->delete();

        return redirect()->back()->with('success', 'Beach deleted successfully!');
    }
}
