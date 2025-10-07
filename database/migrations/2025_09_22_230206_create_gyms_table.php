<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gyms', function (Blueprint $table) {
            $table->id();
            $table->string('location');
            $table->string('name');
            $table->text('description');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('equipment_type');
            $table->string('gym_type');
            $table->text('facilities');  // Comma-separated or JSON
            $table->string('price');
            $table->string('main_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->json('opening_hours');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gyms');
    }
};
