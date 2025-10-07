<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gym extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'name',
        'description',
        'latitude',
        'longitude',
        'equipment_type',
        'gym_type',
        'facilities',
        'price',
        'main_image',
        'gallery_images',
        'opening_hours',
    ];

    protected $casts = [
        'facilities' => 'array',  // If storing as JSON; otherwise, remove if comma-separated string
        'gallery_images' => 'array',  // Assuming JSON array of image paths
        'opening_hours' => 'array',   // JSON object for hours
    ];
}
