<?php

namespace Database\Factories;

use App\Models\Beach;
use App\Models\BeachImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class BeachImageFactory extends Factory
{
    protected $model = BeachImage::class;

    public function definition()
    {
        return [
            'beach_id' => Beach::factory(),
            'image_path' => 'beaches/' . $this->faker->uuid . '.jpg',
            'type' => $this->faker->randomElement(['main', 'gallery']),
        ];
    }
}
