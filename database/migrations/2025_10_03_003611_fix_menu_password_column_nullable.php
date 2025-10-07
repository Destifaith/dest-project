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
        // First, let's check what we're working with
        $hasNulls = DB::table('eateries')
            ->whereNull('menu_password')
            ->orWhere('menu_password', '')
            ->exists();

        echo "Found eateries with empty passwords: " . ($hasNulls ? 'YES' : 'NO') . "\n";

        // Fix the column to not allow nulls and set default empty string
        Schema::table('eateries', function (Blueprint $table) {
            $table->string('menu_password', 100)->nullable(false)->default('')->change();
        });

        echo "✅ Fixed menu_password column structure\n";

        // Generate passwords for all eateries with daily specials
        $eateriesToUpdate = DB::table('eateries')
            ->where('has_daily_specials', true)
            ->where(function ($query) {
                $query->whereNull('menu_password')
                    ->orWhere('menu_password', '');
            })
            ->get();

        echo "Updating passwords for {$eateriesToUpdate->count()} eateries\n";

        foreach ($eateriesToUpdate as $eatery) {
            $newPassword = Str::random(8);
            DB::table('eateries')
                ->where('id', $eatery->id)
                ->update(['menu_password' => $newPassword]);

            echo "Set password for {$eatery->name}: {$newPassword}\n";
        }

        echo "✅ Password generation complete\n";
    }

    public function down()
    {
        // Revert to nullable
        Schema::table('eateries', function (Blueprint $table) {
            $table->string('menu_password', 100)->nullable()->default(null)->change();
        });
    }
};
