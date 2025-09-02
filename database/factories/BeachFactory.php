<?php

namespace Database\Factories;

use App\Models\Beach;
use Illuminate\Database\Eloquent\Factories\Factory;

class BeachFactory extends Factory
{
    protected $model = Beach::class;

    public function definition()
    {
        return [
            'name' => $this->faker->city . ' Beach',
            'description' => $this->faker->paragraph,
            'latitude' => $this->faker->latitude(-90, 90),
            'longitude' => $this->faker->longitude(-180, 180),
            'location' => $this->faker->address,
            'sand_type' => $this->faker->randomElement(['White', 'Golden', 'Black']),
            'water_type' => $this->faker->randomElement(['Saltwater', 'Freshwater']),
            'facilities' => $this->faker->randomElements(
                ['Restrooms', 'Parking', 'Restaurants', 'Lifeguards', 'Showers'],
                rand(2, 4)
            ),
            'is_public' => $this->faker->boolean(80),
        ];
    }
}
