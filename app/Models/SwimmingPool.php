<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SwimmingPool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'location',
        'latitude',
        'longitude',
        'pool_type',
        'water_type',
        'facilities',
        'price',
        'status',
        'main_image',
        'gallery_images',
        'opening_hours'
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'opening_hours' => 'array',
    ];
}
