<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('swimming_pools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('location');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 10, 8);
            $table->enum('pool_type', [
                'Olympic',
                'Infinity',
                'Childrens', // Removed the apostrophe
                'Lap Pool',
                'Hotel Pool',
                'Public Pool'
            ]);
            $table->enum('water_type', [
                'Chlorinated',
                'Saltwater',
                'Freshwater',
                'Mineral Water'
            ]);
            $table->text('facilities');
            $table->string('price');
            $table->string('main_image');
            $table->json('gallery_images')->nullable();
            $table->json('opening_hours');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('swimming_pools');
    }
};
