<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 10, 8);
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->enum('event_type', ['Concert', 'Conference', 'Festival', 'Sports', 'Exhibition', 'Workshop', 'Networking', 'Other']);
            $table->string('organizer');
            $table->string('contact_email');
            $table->string('contact_phone')->nullable();
            $table->string('website')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('capacity')->nullable();
            $table->string('main_image');
            $table->json('gallery_images')->nullable();
            $table->enum('status', ['active', 'inactive', 'sold_out', 'cancelled'])->default('active');
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
