<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Spa extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'name',
        'description',
        'latitude',
        'longitude',
        'treatment_type',
        'ambiance_type',
        'facilities',
        'status',
        'price',
        'main_image',
        'gallery_images',
        'opening_hours',
        // ADD THESE NEW FIELDS:
        'contact_phone',
        'contact_email',
        'website',
        'has_thermal_facilities',
        'has_wellness_programs',
        'has_couples_retreat',
        'has_meditation',
        'has_yoga',
        'has_detox_programs',
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    protected $casts = [
        'facilities' => 'array',
        'gallery_images' => 'array',
        'opening_hours' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'price' => 'string',
        // ADD THESE NEW CASTS:
        'has_thermal_facilities' => 'boolean',
        'has_wellness_programs' => 'boolean',
        'has_couples_retreat' => 'boolean',
        'has_meditation' => 'boolean',
        'has_yoga' => 'boolean',
        'has_detox_programs' => 'boolean',
    ];
}
