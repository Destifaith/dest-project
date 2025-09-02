<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beach extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'latitude',
        'longitude',
        'location',
        'sand_type',
        'water_type',
        'facilities',
        'is_public',
    ];

    protected $casts = [
        'facilities' => 'array',
    ];

    public function images()
    {
        return $this->hasMany(BeachImage::class);
    }

    public function mainImage()
    {
        return $this->hasOne(BeachImage::class)->where('type', 'main');
    }

    public function galleryImages()
    {
        return $this->hasMany(BeachImage::class)->where('type', 'gallery');
    }
}
