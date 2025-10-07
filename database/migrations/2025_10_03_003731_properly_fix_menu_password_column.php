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
        // Step 1: First, set all NULL and empty values to actual passwords
        $this->info("Setting passwords for eateries with empty or NULL values...");

        $eateriesToUpdate = DB::table('eateries')
            ->where('has_daily_specials', true)
            ->where(function ($query) {
                $query->whereNull('menu_password')
                    ->orWhere('menu_password', '')
                    ->orWhere('menu_password', 'null');
            })
            ->get();

        $this->info("Found {$eateriesToUpdate->count()} eateries to update");

        foreach ($eateriesToUpdate as $eatery) {
            $newPassword = Str::random(8);
            $result = DB::table('eateries')
                ->where('id', $eatery->id)
                ->update(['menu_password' => $newPassword]);

            if ($result) {
                $this->info("✅ Set password for {$eatery->name}: {$newPassword}");
            } else {
                $this->error("❌ Failed to set password for {$eatery->name}");
            }
        }

        // Step 2: Now alter the column to be NOT NULL
        $this->info("Altering column structure...");

        Schema::table('eateries', function (Blueprint $table) {
            $table->string('menu_password', 100)->nullable(false)->default(Str::random(8))->change();
        });

        $this->info("✅ Column structure updated successfully");

        // Step 3: Verify the fix
        $nullCount = DB::table('eateries')
            ->whereNull('menu_password')
            ->count();

        $emptyCount = DB::table('eateries')
            ->where('menu_password', '')
            ->count();

        $this->info("Verification:");
        $this->info("  NULL passwords: {$nullCount}");
        $this->info("  Empty passwords: {$emptyCount}");
    }

    public function down()
    {
        Schema::table('eateries', function (Blueprint $table) {
            $table->string('menu_password', 100)->nullable()->default(null)->change();
        });
    }

    // Helper method to output messages
    private function info($message)
    {
        echo $message . "\n";
    }

    private function error($message)
    {
        echo $message . "\n";
    }
};
