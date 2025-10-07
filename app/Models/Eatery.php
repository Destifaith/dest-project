<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Eatery extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'description',
        'eatery_type',
        'cuisine_type',
        'latitude',
        'longitude',
        'opening_hours',
        'special_closure_days',
        'contact_phone',
        'contact_email',
        'website',
        'capacity',
        'features',
        'reservation_policy',
        'price_range',
        'service_type',
        'has_daily_specials',
        'daily_specials_email',
        'main_image',
        'gallery_images',
        'menu_pdf',
        'owner_full_name',
        'owner_bio',
        'owner_experience_years',
        'owner_specialties',
        'owner_education',
        'owner_image',
        'awards',
        'status'
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'special_closure_days' => 'array',
        'features' => 'array',
        'gallery_images' => 'array',
        'awards' => 'array',
        'has_daily_specials' => 'boolean',
        'capacity' => 'integer',
        'owner_experience_years' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Accessors for formatted data
    protected function openingHours(): Attribute
    {
        return Attribute::make(
            get: fn($value) => is_array($value) ? $value : json_decode($value, true),
            set: fn($value) => is_string($value) ? $value : json_encode($value),
        );
    }

    protected function specialClosureDays(): Attribute
    {
        return Attribute::make(
            get: fn($value) => is_array($value) ? $value : json_decode($value, true) ?? [],
            set: fn($value) => is_string($value) ? $value : json_encode($value),
        );
    }

    // CORRECTED accessor for main_image - fixes double path issue
    protected function mainImage(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) return null;

                // Fix double 'eateries/' path if it exists
                if (strpos($value, 'eateries/eateries/') === 0) {
                    $value = substr($value, 9); // Remove the first 'eateries/'
                }

                return "/storage/{$value}";
            },
        );
    }

    protected function features(): Attribute
    {
        return Attribute::make(
            get: fn($value) => is_array($value) ? $value : json_decode($value, true),
            set: fn($value) => is_string($value) ? $value : json_encode($value),
        );
    }

    // UPDATED accessor for gallery_images to fix paths in array
    protected function galleryImages(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $images = is_array($value) ? $value : json_decode($value, true);
                if (!$images) return [];

                return array_map(function ($image) {
                    // Fix double 'eateries/' path if it exists
                    if (strpos($image, 'eateries/eateries/') === 0) {
                        $image = substr($image, 9); // Remove the first 'eateries/'
                    }
                    return "/storage/{$image}";
                }, $images);
            },
            set: fn($value) => is_string($value) ? $value : json_encode($value),
        );
    }

    // UPDATED accessor for awards to fix image paths in awards array
    protected function awards(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $awards = is_array($value) ? $value : json_decode($value, true);
                if (!$awards) return [];

                return array_map(function ($award) {
                    if (isset($award['image_path']) && $award['image_path']) {
                        // Fix double 'eateries/' path if it exists
                        if (strpos($award['image_path'], 'eateries/eateries/') === 0) {
                            $award['image_path'] = substr($award['image_path'], 9);
                        }
                        $award['image_path'] = "/storage/{$award['image_path']}";
                    }
                    return $award;
                }, $awards);
            },
            set: fn($value) => is_string($value) ? $value : json_encode($value),
        );
    }

    // Accessor for owner_image to fix the same issue
    protected function ownerImage(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) return null;

                // Fix double 'eateries/' path if it exists
                if (strpos($value, 'eateries/eateries/') === 0) {
                    $value = substr($value, 9); // Remove the first 'eateries/'
                }

                return "/storage/{$value}";
            },
        );
    }

    // Accessor for menu_pdf to fix the same issue
    protected function menuPdf(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) return null;

                // Fix double 'eateries/' path if it exists
                if (strpos($value, 'eateries/eateries/') === 0) {
                    $value = substr($value, 9); // Remove the first 'eateries/'
                }

                return "/storage/{$value}";
            },
        );
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('eatery_type', $type);
    }

    public function scopeByCuisine($query, $cuisine)
    {
        return $query->where('cuisine_type', $cuisine);
    }

    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        return $query->whereRaw("
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) < ?
        ", [$latitude, $longitude, $latitude, $radius]);
    }

    // Relationships (if you have users who own eateries)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dailyMenus()
    {
        return $this->hasMany(EateryMenu::class, 'eatery_id');
    }

    // Add this relationship to get only active daily menus
    public function activeDailyMenus()
    {
        return $this->hasMany(EateryMenu::class)->where('status', 'active');
    }

    // app/Models/Eatery.php
    public function menus()
    {
        return $this->hasMany(EateryMenu::class);
    }

    // ENHANCED: Check if the eatery is currently open
    public function isOpen()
    {
        $now = now();
        $currentDay = strtolower($now->format('l')); // 'monday', 'tuesday', etc.
        $currentTime = $now->format('H:i');

        // Check if today is a special closure day
        if ($this->isSpecialClosureDay($now)) {
            return false;
        }

        // Get today's opening hours
        $todayHours = $this->opening_hours[$currentDay] ?? null;

        if (!$todayHours || !$todayHours['isOpen']) {
            return false;
        }

        // Handle overnight hours (close time is next day)
        $openTime = $todayHours['openTime'];
        $closeTime = $todayHours['closeTime'];

        // If close time is earlier than open time, it means it closes the next day
        if ($closeTime < $openTime) {
            // Current time is after open time OR before close time (next day)
            return $currentTime >= $openTime || $currentTime <= $closeTime;
        } else {
            // Normal operating hours
            return $currentTime >= $openTime && $currentTime <= $closeTime;
        }
    }

    /**
     * Check if the given date is a special closure day
     */
    private function isSpecialClosureDay($date)
    {
        if (empty($this->special_closure_days)) {
            return false;
        }

        $dateString = $date->format('Y-m-d');

        foreach ($this->special_closure_days as $closureDay) {
            if (
                isset($closureDay['date']) && $closureDay['date'] === $dateString &&
                isset($closureDay['isClosed']) && $closureDay['isClosed']
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get today's opening hours in a readable format
     */
    public function getTodayHoursAttribute()
    {
        $currentDay = strtolower(now()->format('l'));
        $todayHours = $this->opening_hours[$currentDay] ?? null;

        if (!$todayHours || !$todayHours['isOpen']) {
            return 'Closed Today';
        }

        return $todayHours['openTime'] . ' - ' . $todayHours['closeTime'];
    }

    /**
     * Get current status with message
     */
    public function getCurrentStatusAttribute()
    {
        if ($this->isOpen()) {
            $currentDay = strtolower(now()->format('l'));
            $todayHours = $this->opening_hours[$currentDay] ?? null;
            $closeTime = $todayHours['closeTime'] ?? '';

            return [
                'status' => 'open',
                'message' => 'Open Now - Until ' . $closeTime
            ];
        } else {
            // Check why it's closed
            $currentDay = strtolower(now()->format('l'));
            $todayHours = $this->opening_hours[$currentDay] ?? null;

            if ($this->isSpecialClosureDay(now())) {
                return [
                    'status' => 'closed',
                    'message' => 'Closed for Special Event'
                ];
            } elseif (!$todayHours || !$todayHours['isOpen']) {
                return [
                    'status' => 'closed',
                    'message' => 'Closed Today'
                ];
            } else {
                $openTime = $todayHours['openTime'] ?? '';
                return [
                    'status' => 'closed',
                    'message' => 'Opens at ' . $openTime
                ];
            }
        }
    }

    /**
     * Get weekly hours summary
     */
    public function getWeeklyHoursSummary()
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $summary = [];

        foreach ($days as $day) {
            $hours = $this->opening_hours[$day] ?? null;
            if ($hours && $hours['isOpen']) {
                $summary[ucfirst($day)] = $hours['openTime'] . ' - ' . $hours['closeTime'];
            } else {
                $summary[ucfirst($day)] = 'Closed';
            }
        }

        return $summary;
    }

    /**
     * Check if eatery is open on a specific date and time
     */
    public function isOpenOn($dateTime)
    {
        $date = $dateTime instanceof \DateTime ? $dateTime : new \DateTime($dateTime);
        $dayName = strtolower($date->format('l'));
        $time = $date->format('H:i');

        // Check if it's a special closure day
        if ($this->isSpecialClosureDay($date)) {
            return false;
        }

        $hours = $this->opening_hours[$dayName] ?? null;

        if (!$hours || !$hours['isOpen']) {
            return false;
        }

        $openTime = $hours['openTime'];
        $closeTime = $hours['closeTime'];

        // Handle overnight hours
        if ($closeTime < $openTime) {
            return $time >= $openTime || $time <= $closeTime;
        } else {
            return $time >= $openTime && $time <= $closeTime;
        }
    }

    // Helper methods
    public function getFeaturesList()
    {
        return $this->features ?: [];
    }

    public function getAwardsList()
    {
        return $this->awards ?: [];
    }

    public function getGalleryImagesList()
    {
        return $this->gallery_images ?: [];
    }

    /**
     * Get next opening time
     */
    public function getNextOpeningTime()
    {
        $now = now();

        // Check today first
        $currentDay = strtolower($now->format('l'));
        $todayHours = $this->opening_hours[$currentDay] ?? null;

        if ($todayHours && $todayHours['isOpen']) {
            $openTime = $todayHours['openTime'];
            $currentTime = $now->format('H:i');

            // If open later today
            if ($currentTime < $openTime) {
                return "Today at " . $openTime;
            }
        }

        // Check next 7 days
        for ($i = 1; $i <= 7; $i++) {
            $futureDate = $now->copy()->addDays($i);
            $futureDay = strtolower($futureDate->format('l'));
            $futureHours = $this->opening_hours[$futureDay] ?? null;

            if ($futureHours && $futureHours['isOpen'] && !$this->isSpecialClosureDay($futureDate)) {
                $dayName = $futureDate->format('l');
                return $dayName . " at " . $futureHours['openTime'];
            }
        }

        return "No upcoming opening times";
    }
}
