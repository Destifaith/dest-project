<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Models\Eatery;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EateryPublicController extends Controller
{
    public function show(Request $request)
    {
        $eateryId = $request->query('id');

        $eatery = Eatery::where('id', $eateryId)
            ->where('status', 'approved')
            ->first();

        if (!$eatery) {
            abort(404, 'Eatery not found');
        }

        // Load the daily menus relationship
        $eatery->load(['dailyMenus' => function ($query) {
            $query->where('status', 'active')
                ->orderBy('menu_date', 'desc')
                ->limit(7);
        }]);

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
            'website' => $eatery->website,
            'features' => $eatery->features,
            'reservation_policy' => $eatery->reservation_policy,
            'service_type' => $eatery->service_type,
            'is_open' => $eatery->isOpen(), // Real-time open status
            'current_status' => $eatery->current_status, // Enhanced status information
            'today_hours' => $eatery->today_hours, // Today's hours in readable format
            'daily_menus' => $eatery->dailyMenus,
            'gallery_images' => $eatery->gallery_images,
            'awards' => $eatery->awards,
            'owner_full_name' => $eatery->owner_full_name,
            'owner_bio' => $eatery->owner_bio,
            'owner_experience_years' => $eatery->owner_experience_years,
            'owner_specialties' => $eatery->owner_specialties,
            'owner_education' => $eatery->owner_education,
            'owner_image' => $eatery->owner_image,
        ];

        return Inertia::render('Main/Eateries/EateryDetailed', [
            'eatery' => $eateryData,
        ]);
    }

    /**
     * Show booking page for eatery
     */
    public function booking(Request $request)
    {
        $eateryId = $request->query('id');

        $eatery = Eatery::where('id', $eateryId)
            ->where('status', 'approved')
            ->first();

        if (!$eatery) {
            abort(404, 'Eatery not found');
        }
        // 🔥 ADD THIS: Load daily menus just like in show()
        $eatery->load(['dailyMenus' => function ($query) {
            $query->where('status', 'active')
                ->orderBy('menu_date', 'desc')
                ->limit(7);
        }]);
        // Prepare eatery data with comprehensive status information for booking
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
            'website' => $eatery->website,
            'reservation_policy' => $eatery->reservation_policy,
            'is_open' => $eatery->isOpen(), // Real-time open status
            'current_status' => $eatery->current_status, // Enhanced status information
            'today_hours' => $eatery->today_hours, // Today's hours in readable format
            'next_opening_time' => $eatery->getNextOpeningTime(), // When it opens next
            // 🔥 ADD THIS LINE:
            'daily_menus' => $eatery->dailyMenus,
        ];

        return Inertia::render('Main/Eateries/EateryBooking', [
            'eatery' => $eateryData,
        ]);
    }

    /**
     * Check real-time status of an eatery (API endpoint)
     */
    public function checkStatus($id)
    {
        $eatery = Eatery::where('id', $id)
            ->where('status', 'approved')
            ->firstOrFail();

        return response()->json([
            'is_open' => $eatery->isOpen(),
            'current_status' => $eatery->current_status,
            'today_hours' => $eatery->today_hours,
            'next_opening_time' => $eatery->getNextOpeningTime(),
            'updated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get weekly hours for an eatery
     */
    public function weeklyHours($id)
    {
        $eatery = Eatery::where('id', $id)
            ->where('status', 'approved')
            ->firstOrFail();

        return response()->json([
            'weekly_hours' => $eatery->getWeeklyHoursSummary(),
        ]);
    }
}
