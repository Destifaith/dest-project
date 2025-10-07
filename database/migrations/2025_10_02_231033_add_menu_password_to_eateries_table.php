<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up()
    {
        Schema::table('eateries', function (Blueprint $table) {
            $table->string('menu_password')->nullable()->after('has_daily_specials');
        });

        // Generate passwords for existing eateries
        $eateries = \App\Models\Eatery::where('has_daily_specials', true)->get();
        foreach ($eateries as $eatery) {
            $eatery->update([
                'menu_password' => Str::random(8) // Generate 8-character password
            ]);
        }
    }

    public function down()
    {
        Schema::table('eateries', function (Blueprint $table) {
            $table->dropColumn('menu_password');
        });
    }
};
