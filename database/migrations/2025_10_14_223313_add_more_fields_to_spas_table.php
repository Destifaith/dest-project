<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('spas', function (Blueprint $table) {
            // Contact information
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('website')->nullable();

            // Facility flags
            $table->boolean('has_thermal_facilities')->default(false);
            $table->boolean('has_wellness_programs')->default(false);
            $table->boolean('has_couples_retreat')->default(false);
            $table->boolean('has_meditation')->default(false);
            $table->boolean('has_yoga')->default(false);
            $table->boolean('has_detox_programs')->default(false);
        });
    }

    public function down()
    {
        Schema::table('spas', function (Blueprint $table) {
            $table->dropColumn([
                'contact_phone',
                'contact_email',
                'website',
                'has_thermal_facilities',
                'has_wellness_programs',
                'has_couples_retreat',
                'has_meditation',
                'has_yoga',
                'has_detox_programs'
            ]);
        });
    }
};
