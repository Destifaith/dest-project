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
        echo "Setting initial passwords for all eateries...\n";

        // Get all eateries that need passwords
        $eateries = DB::table('eateries')
            ->where(function ($query) {
                $query->whereNull('menu_password')
                    ->orWhere('menu_password', '');
            })
            ->get();

        echo "Found {$eateries->count()} eateries to update\n";

        foreach ($eateries as $eatery) {
            $newPassword = Str::random(8);
            $result = DB::table('eateries')
                ->where('id', $eatery->id)
                ->update(['menu_password' => $newPassword]);

            if ($result) {
                echo "✅ Set password for {$eatery->name}: {$newPassword}\n";
            } else {
                echo "❌ Failed to set password for {$eatery->name}\n";
            }
        }

        echo "Password setup complete!\n";

        // Verify
        $nullCount = DB::table('eateries')->whereNull('menu_password')->count();
        $emptyCount = DB::table('eateries')->where('menu_password', '')->count();
        $validCount = DB::table('eateries')->whereNotNull('menu_password')->where('menu_password', '!=', '')->count();

        echo "\n📊 Final verification:\n";
        echo "  NULL passwords: {$nullCount}\n";
        echo "  Empty passwords: {$emptyCount}\n";
        echo "  Valid passwords: {$validCount}\n";
    }

    public function down()
    {
        // We don't want to revert this as it would remove passwords
        echo "This migration cannot be reverted (password data would be lost)\n";
    }
};
