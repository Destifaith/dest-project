<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'latitude',
        'longitude',
        'start_date',
        'end_date',
        'event_type',
        'organizer',
        'contact_email',
        'contact_phone',
        'website',
        'price',
        'capacity',
        'main_image',
        'gallery_images',
        'status',
        'tags'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'gallery_images' => 'array',
        'tags' => 'array',
        'price' => 'decimal:2'
    ];

    public function getIsUpcomingAttribute()
    {
        return $this->start_date > now();
    }

    public function getIsOngoingAttribute()
    {
        return $this->start_date <= now() && $this->end_date >= now();
    }

    public function getIsPastAttribute()
    {
        return $this->end_date < now();
    }
}
