<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class InspectPasswordData extends Command
{
    protected $signature = 'debug:inspect-passwords';
    protected $description = 'Inspect actual password data in database';

    public function handle()
    {
        $this->info("Inspecting menu_password data...");

        // Check all possible states
        $results = DB::table('eateries')
            ->select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN menu_password IS NULL THEN 1 ELSE 0 END) as null_count'),
                DB::raw('SUM(CASE WHEN menu_password = "" THEN 1 ELSE 0 END) as empty_count'),
                DB::raw('SUM(CASE WHEN menu_password = "null" THEN 1 ELSE 0 END) as string_null_count'),
                DB::raw('SUM(CASE WHEN menu_password IS NOT NULL AND menu_password != "" AND menu_password != "null" THEN 1 ELSE 0 END) as valid_count')
            )
            ->first();

        $this->info("📊 Password Data Analysis:");
        $this->info("  Total records: {$results->total}");
        $this->info("  NULL values: {$results->null_count}");
        $this->info("  Empty string values: {$results->empty_count}");
        $this->info("  'null' string values: {$results->string_null_count}");
        $this->info("  Valid values: {$results->valid_count}");

        // Show some examples
        $this->info("\n🔍 Sample data:");
        $samples = DB::table('eateries')
            ->select('id', 'name', 'menu_password')
            ->limit(5)
            ->get();

        foreach ($samples as $sample) {
            $passwordDisplay = $sample->menu_password === null ? 'NULL' : "'{$sample->menu_password}'";
            $this->info("  {$sample->name}: {$passwordDisplay}");
        }

        // Check Golden Gateway specifically
        $golden = DB::table('eateries')
            ->where('name', 'Golden Gateway Hotel')
            ->select('id', 'name', 'menu_password')
            ->first();

        if ($golden) {
            $goldenPassword = $golden->menu_password === null ? 'NULL' : "'{$golden->menu_password}'";
            $this->info("\n🎯 Golden Gateway Hotel:");
            $this->info("  Password: {$goldenPassword}");
            $this->info("  Type: " . gettype($golden->menu_password));
        }
    }
}
