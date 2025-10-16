<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('gyms', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('gallery_images');
        });
    }

    public function down()
    {
        Schema::table('gyms', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
