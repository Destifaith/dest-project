<?php
// database/seeders/SwimmingPoolSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SwimmingPool;

class SwimmingPoolSeeder extends Seeder
{
    public function run()
    {
        SwimmingPool::factory()->count(10)->create();
    }
}
