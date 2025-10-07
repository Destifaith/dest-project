<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('eateries', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');
            $table->text('location');
            $table->text('description');
            $table->string('eatery_type');
            $table->string('cuisine_type')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);

            // Operations & Contact
            $table->json('opening_hours');
            $table->text('special_closure_days')->nullable();
            $table->string('contact_phone');
            $table->string('contact_email')->nullable();
            $table->string('website')->nullable();
            $table->integer('capacity')->nullable();
            $table->json('features')->nullable();
            $table->text('reservation_policy')->nullable();

            // Pricing & Service
            $table->string('price_range')->nullable();
            $table->string('service_type')->nullable();

            // Media & Specials
            $table->boolean('has_daily_specials')->default(false);
            $table->string('daily_specials_email')->nullable();
            $table->string('main_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->string('menu_pdf')->nullable();

            // Owner Information
            $table->string('owner_full_name');
            $table->text('owner_bio');
            $table->integer('owner_experience_years')->nullable();
            $table->text('owner_specialties')->nullable();
            $table->string('owner_education')->nullable();
            $table->string('owner_image')->nullable();

            // Awards
            $table->json('awards')->nullable();

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['eatery_type', 'status']);
            $table->index(['latitude', 'longitude']);
            $table->index('price_range');
        });
    }

    public function down()
    {
        Schema::dropIfExists('eateries');
    }
};
