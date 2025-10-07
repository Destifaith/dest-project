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
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');
            $table->text('location');
            $table->text('description');
            $table->string('cuisine_type');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);

            // Operations & Contact
            $table->json('opening_hours')->nullable();
            $table->text('special_closure_days')->nullable();
            $table->string('contact_phone');
            $table->string('contact_email')->nullable();
            $table->string('website')->nullable();
            $table->integer('capacity')->nullable();
            $table->json('features')->nullable();
            $table->text('reservation_policy')->nullable();

            // Media & Menu
            $table->boolean('has_daily_menu')->default(false);
            $table->string('daily_menu_email')->nullable();
            $table->string('main_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->string('menu_pdf')->nullable();

            // Owner/Chef Information
            $table->string('owner_full_name');
            $table->text('owner_bio');
            $table->integer('owner_experience_years')->nullable();
            $table->text('owner_specialties')->nullable();
            $table->string('owner_education')->nullable();
            $table->string('owner_image')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
