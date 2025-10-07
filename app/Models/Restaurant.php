<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'description',
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
        'has_daily_menu',
        'daily_menu_email',
        'main_image',
        'gallery_images',
        'menu_pdf',
        'owner_full_name',
        'owner_bio',
        'owner_experience_years',
        'owner_specialties',
        'owner_education',
        'owner_image',
        'is_active', // Add this line

    ];

    protected $casts = [
        'opening_hours' => 'array',
        'features' => 'array',
        'gallery_images' => 'array',
        'has_daily_menu' => 'boolean',
        'capacity' => 'integer',
        'owner_experience_years' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean', // Add this line

    ];

    public function awards(): HasMany
    {
        return $this->hasMany(Award::class);
    }
}
