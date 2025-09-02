<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BeachImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'beach_id',
        'image_path',
        'type',
    ];

    public function beach()
    {
        return $this->belongsTo(Beach::class);
    }
}
