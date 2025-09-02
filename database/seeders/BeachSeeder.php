<?php

namespace Database\Seeders;

use App\Models\Beach;
use App\Models\BeachImage;
use Illuminate\Database\Seeder;

class BeachSeeder extends Seeder
{
    public function run(): void
    {
        Beach::factory(10)->create()->each(function ($beach) {
            // Add one main image
            BeachImage::factory()->create([
                'beach_id' => $beach->id,
                'type' => 'main',
            ]);

            // Add 3 gallery images
            BeachImage::factory(3)->create([
                'beach_id' => $beach->id,
                'type' => 'gallery',
            ]);
        });
    }
}
