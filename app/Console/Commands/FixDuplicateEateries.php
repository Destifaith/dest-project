<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDuplicateEateries extends Command
{
    protected $signature = 'fix:duplicate-eateries';
    protected $description = 'Find and fix duplicate eatery entries';

    public function handle()
    {
        $this->info("Looking for duplicate eateries...");

        // Find duplicates by name
        $duplicates = DB::table('eateries')
            ->select('name', DB::raw('COUNT(*) as count'))
            ->groupBy('name')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info("✅ No duplicate eateries found");
            return;
        }

        $this->warn("Found duplicate eateries:");
        foreach ($duplicates as $duplicate) {
            $this->info("  {$duplicate->name}: {$duplicate->count} entries");

            // Get the duplicate records
            $records = DB::table('eateries')
                ->where('name', $duplicate->name)
                ->orderBy('id')
                ->get();

            $this->info("    Records:");
            foreach ($records as $record) {
                $this->info("      ID: {$record->id}, Created: {$record->created_at}");
            }

            // Keep the first one, delete the rest
            $firstId = $records->first()->id;
            $toDelete = $records->slice(1);

            foreach ($toDelete as $deleteRecord) {
                $this->warn("    🗑️ Deleting duplicate ID: {$deleteRecord->id}");
                DB::table('eateries')->where('id', $deleteRecord->id)->delete();
            }
        }

        $this->info("✅ Duplicate cleanup complete");
    }
}
