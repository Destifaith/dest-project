<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up()
    {
        // Add a simple temporary field that we know will work
        Schema::table('eateries', function (Blueprint $table) {
            $table->string('temp_menu_code')->nullable()->after('has_daily_specials');
        });

        // Generate codes for all eateries
        $eateries = DB::table('eateries')->where('has_daily_specials', true)->get();

        foreach ($eateries as $eatery) {
            DB::table('eateries')
                ->where('id', $eatery->id)
                ->update(['temp_menu_code' => Str::random(6)]);
        }

        echo "✅ Generated temp menu codes for {$eateries->count()} eateries\n";
    }

    public function down()
    {
        Schema::table('eateries', function (Blueprint $table) {
            $table->dropColumn('temp_menu_code');
        });
    }
};
