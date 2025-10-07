<?php
// database/factories/SwimmingPoolFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SwimmingPoolFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->words(3, true) . ' Swimming Pool',
            'description' => $this->faker->paragraphs(3, true),
            'location' => $this->faker->address,
            'latitude' => $this->faker->latitude,
            'longitude' => $this->faker->longitude,
            'pool_type' => $this->faker->randomElement(['Olympic', 'Infinity', 'Children', 'Lap', 'Therapeutic']),
            'water_type' => $this->faker->randomElement(['Chlorinated', 'Saltwater', 'Freshwater', 'Ozonated']),
            'facilities' => json_encode(['Changing rooms', 'Sun loungers', 'Pool bar', 'Showers', 'Towels']),
            'price' => $this->faker->randomElement(['$20 per day', '$15 for adults, $10 for children', 'Free entry', '$50 monthly membership']),
            'main_image' => 'swimming-pools/sample-pool.jpg',
            'gallery_images' => json_encode([
                'swimming-pools/gallery/pool1.jpg',
                'swimming-pools/gallery/pool2.jpg'
            ]),
        ];
    }
}
