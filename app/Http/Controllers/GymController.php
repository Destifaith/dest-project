<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class GymController extends Controller
{
    public function create()
    {
        // Render the AddGym React component via Inertia
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
        ]);

        // Redirect or return success (Inertia handles client-side redirect)
        return redirect('/dashboard/entertainment/gym/manage')->with('success', 'Gym added successfully!');
    }
    public function destroy(Gym $gym)
    {
        // Delete associated images from storage
        if ($gym->main_image) {
            Storage::disk('public')->delete($gym->main_image);
        }
        if ($gym->gallery_images) {
            foreach ($gym->gallery_images as $image) {
                Storage::disk('public')->delete($image);
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
            if ($gym->main_image) {
                Storage::delete('public/' . $gym->main_image);
            }
            $validated['main_image'] = $request->file('main_image')->store('gyms', 'public');
        }

        if ($request->hasFile('gallery_images')) {
            $galleryImages = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('gyms', 'public');
            }
            $validated['gallery_images'] = json_encode($galleryImages);
        }

        $gym->update($validated);

        return redirect()->route('gyms.manage')->with('success', 'Gym updated successfully.');
    }
}
