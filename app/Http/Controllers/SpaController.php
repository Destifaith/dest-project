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
            // NEW FIELDS:
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'website' => 'nullable|url',
            'has_thermal_facilities' => 'nullable|boolean',
            'has_wellness_programs' => 'nullable|boolean',
            'has_couples_retreat' => 'nullable|boolean',
            'has_meditation' => 'nullable|boolean',
            'has_yoga' => 'nullable|boolean',
            'has_detox_programs' => 'nullable|boolean',
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
            // NEW FIELDS:
            'contact_phone' => $validated['contact_phone'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'website' => $validated['website'] ?? null,
            'has_thermal_facilities' => $validated['has_thermal_facilities'] ?? false,
            'has_wellness_programs' => $validated['has_wellness_programs'] ?? false,
            'has_couples_retreat' => $validated['has_couples_retreat'] ?? false,
            'has_meditation' => $validated['has_meditation'] ?? false,
            'has_yoga' => $validated['has_yoga'] ?? false,
            'has_detox_programs' => $validated['has_detox_programs'] ?? false,
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
            $galleryImages = json_decode($spa->gallery_images, true);
            if (is_array($galleryImages)) {
                foreach ($galleryImages as $image) {
                    Storage::disk('public')->delete($image);
                }
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
            // NEW FIELDS:
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'website' => 'nullable|url',
            'has_thermal_facilities' => 'nullable|boolean',
            'has_wellness_programs' => 'nullable|boolean',
            'has_couples_retreat' => 'nullable|boolean',
            'has_meditation' => 'nullable|boolean',
            'has_yoga' => 'nullable|boolean',
            'has_detox_programs' => 'nullable|boolean',
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

    public function frontendIndex()
    {
        $spas = Spa::where('status', 'active')->get();

        return Inertia::render('Main/Spa/Page', [
            'spas' => $spas
        ]);
    }

    /**
     * Display single spa for frontend (Inertia)
     */
    public function frontendShow(Spa $spa)
    {
        if ($spa->status !== 'active') {
            abort(404);
        }

        // Parse gallery images if they exist
        $galleryImages = [];
        if ($spa->gallery_images) {
            try {
                $galleryImages = json_decode($spa->gallery_images, true);
                if (!is_array($galleryImages)) {
                    $galleryImages = [];
                }
            } catch (\Exception $e) {
                $galleryImages = [];
            }
        }

        // Parse opening hours if they exist
        $openingHours = [];
        if ($spa->opening_hours) {
            try {
                $openingHours = json_decode($spa->opening_hours, true);
                if (!is_array($openingHours)) {
                    $openingHours = [];
                }
            } catch (\Exception $e) {
                $openingHours = [];
            }
        }

        // Parse facilities if they exist
        $facilities = [];
        if ($spa->facilities) {
            try {
                // If facilities is stored as JSON string
                $facilities = json_decode($spa->facilities, true);
                if (!is_array($facilities)) {
                    // If it's a comma-separated string
                    $facilities = array_map('trim', explode(',', $spa->facilities));
                }
            } catch (\Exception $e) {
                // Fallback to comma-separated parsing
                $facilities = array_map('trim', explode(',', $spa->facilities));
            }
        }

        // Sample treatments data - you can replace this with actual treatments from your database
        $treatments = [
            [
                'id' => 1,
                'name' => 'Swedish Massage',
                'description' => 'A gentle, relaxing full-body massage that promotes overall relaxation and improves blood circulation.',
                'duration' => '60 min',
                'price' => '80',
                'category' => 'Massage',
                'benefits' => ['Stress Relief', 'Improved Circulation', 'Muscle Relaxation'],
                'therapist' => 'Sarah Johnson'
            ],
            [
                'id' => 2,
                'name' => 'Hot Stone Therapy',
                'description' => 'Warm stones are placed on key points of the body to deeply relax muscles and release tension.',
                'duration' => '90 min',
                'price' => '120',
                'category' => 'Thermal Therapy',
                'benefits' => ['Deep Muscle Relaxation', 'Pain Relief', 'Improved Sleep'],
                'therapist' => 'Michael Chen'
            ],
            [
                'id' => 3,
                'name' => 'Aromatherapy Facial',
                'description' => 'A luxurious facial treatment using essential oils to rejuvenate and hydrate the skin.',
                'duration' => '75 min',
                'price' => '95',
                'category' => 'Facial Care',
                'benefits' => ['Skin Hydration', 'Stress Reduction', 'Improved Complexion'],
                'therapist' => 'Emma Rodriguez'
            ]
        ];

        // Sample treatment packages
        $treatmentPackages = [
            [
                'name' => 'Ultimate Relaxation Package',
                'price' => '250',
                'duration' => '3 hours',
                'includes' => ['Swedish Massage', 'Aromatherapy Facial', 'Foot Reflexology'],
                'description' => 'Complete wellness experience for ultimate relaxation'
            ],
            [
                'name' => 'Couples Retreat',
                'price' => '400',
                'duration' => '2.5 hours',
                'includes' => ['Couples Massage', 'Private Jacuzzi', 'Champagne Service'],
                'description' => 'Perfect romantic getaway for couples'
            ]
        ];

        // Prepare the spa data for the frontend
        $spaData = [
            'id' => $spa->id,
            'name' => $spa->name,
            'location' => $spa->location,
            'description' => $spa->description,
            'treatment_type' => $spa->treatment_type,
            'ambiance_type' => $spa->ambiance_type,
            'price' => $spa->price,
            'latitude' => $spa->latitude,
            'longitude' => $spa->longitude,
            'main_image' => $spa->main_image,
            'gallery_images' => $galleryImages,
            'opening_hours' => $openingHours,
            'contact_phone' => $spa->contact_phone,
            'contact_email' => $spa->contact_email,
            'website' => $spa->website,
            'facilities' => $facilities,
            'status' => $spa->status,
            'treatments' => $treatments,
            'treatment_packages' => $treatmentPackages,
            'has_thermal_facilities' => $spa->has_thermal_facilities ?? false,
            'has_wellness_programs' => $spa->has_wellness_programs ?? false,
            'has_couples_retreat' => $spa->has_couples_retreat ?? false,
            'has_meditation' => $spa->has_meditation ?? false,
            'has_yoga' => $spa->has_yoga ?? false,
            'has_detox_programs' => $spa->has_detox_programs ?? false,
        ];

        return Inertia::render('Main/Spa/SpaDetailed', [
            'spa' => $spaData
        ]);
    }

    /**
     * Show spa booking form
     */
    public function booking(Request $request)
    {
        $spaId = $request->query('id');

        if (!$spaId) {
            return redirect()->route('spa.index')->with('error', 'No spa selected.');
        }

        $spa = Spa::where('status', 'active')->find($spaId);

        if (!$spa) {
            return redirect()->route('spa.index')->with('error', 'Spa not found or inactive.');
        }

        return Inertia::render('Main/Spa/SpaBooking', [
            'spa' => $spa
        ]);
    }

    /**
     * Manage spas in dashboard
     */
    public function manage()
    {
        $spas = Spa::all();
        return Inertia::render('Dashboard/Entertainment/Spa/ManageSpas', [
            'spas' => $spas
        ]);
    }
}
