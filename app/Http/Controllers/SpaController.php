<?php

namespace App\Http\Controllers;

use App\Models\Spa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SpaController extends Controller
{
    public function create()
    {
        // Render the AddSpa React component via Inertia
        return Inertia::render('Dashboard/Entertainment/Spa/AddSpa');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string',
            'name' => 'required|string',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'treatment_type' => 'required|string',
            'ambiance_type' => 'required|string',
            'facilities' => 'required|string',
            'price' => 'required|string',
            'main_image' => 'required|image|max:2048',
            'gallery_images.*' => 'image|max:2048',
            'opening_hours' => 'required|json',
        ]);

        // Handle main image upload
        $mainImagePath = $request->file('main_image')->store('spas/main', 'public');

        // Handle gallery images
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryPaths[] = $image->store('spas/gallery', 'public');
            }
        }

        // Create the spa record
        Spa::create([
            'location' => $validated['location'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'treatment_type' => $validated['treatment_type'],
            'ambiance_type' => $validated['ambiance_type'],
            'facilities' => $validated['facilities'],
            'price' => $validated['price'],
            'main_image' => $mainImagePath,
            'gallery_images' => json_encode($galleryPaths),
            'opening_hours' => $validated['opening_hours'],
        ]);

        // Redirect or return success (Inertia handles client-side redirect)
        return redirect('/dashboard/entertainment/spa/manage')->with('success', 'Spa added successfully!');
    }
    public function destroy(Spa $spa)
    {
        // Delete associated images from storage
        if ($spa->main_image) {
            Storage::disk('public')->delete($spa->main_image);
        }
        if ($spa->gallery_images) {
            foreach ($spa->gallery_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }
        $spa->delete();
        return redirect()->route('spas.manage')->with('success', 'Spa deleted successfully!');
    }
    public function update(Request $request, Spa $spa)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'treatment_type' => 'nullable|string',
            'ambiance_type' => 'nullable|string',
            'facilities' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'price' => 'nullable|string',
            'main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'required|json',
        ]);

        if ($request->hasFile('main_image')) {
            if ($spa->main_image) {
                Storage::delete('public/' . $spa->main_image);
            }
            $validated['main_image'] = $request->file('main_image')->store('spas', 'public');
        }

        if ($request->hasFile('gallery_images')) {
            $galleryImages = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('spas', 'public');
            }
            $validated['gallery_images'] = json_encode($galleryImages);
        }

        $spa->update($validated);

        return redirect()->route('spas.manage')->with('success', 'Spa updated successfully.');
    }
}
