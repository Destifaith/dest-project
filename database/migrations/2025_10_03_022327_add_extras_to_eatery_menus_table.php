<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('eatery_menus', function (Blueprint $table) {
            $table->json('extras')->nullable()->after('structured_menu');
        });
    }

    public function down()
    {
        Schema::table('eatery_menus', function (Blueprint $table) {
            $table->dropColumn('extras');
        });
    }
};
