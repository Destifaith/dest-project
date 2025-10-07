<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class EateryMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'eatery_id',
        'menu_date',
        'source_type',
        'source_file',
        'extracted_text',
        'structured_menu',
        'status',
        'menu_password',
        'extras', // Add this


    ];

    protected $casts = [
        'structured_menu' => 'array',
        'menu_date' => 'date',
        'extras' => 'array', // Add this line

    ];

    public function eatery()
    {
        return $this->belongsTo(Eatery::class);
    }
    // Add this method to generate password
    public function generateMenuPassword()
    {
        $this->menu_password = Str::random(8);
        $this->save();
        return $this->menu_password;
    }

    // Scope for eateries that can receive menu emails
    public function scopeCanReceiveMenuEmails($query)
    {
        return $query->approved()
            ->where('has_daily_specials', true)
            ->whereNotNull('daily_specials_email')
            ->whereNotNull('menu_password');
    }
}
