<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckEateryFields extends Command
{
    protected $signature = 'debug:eatery-fields';
    protected $description = 'Check available fields in eateries table';

    public function handle()
    {
        $columns = DB::select('DESCRIBE eateries');

        $this->info("Available fields in eateries table:");
        foreach ($columns as $column) {
            $this->info("  {$column->Field} - {$column->Type} - Null: {$column->Null} - Default: {$column->Default}");
        }

        // Show some sample data
        $sample = DB::table('eateries')->first();
        $this->info("\nSample data from first eatery:");
        foreach ($sample as $field => $value) {
            $this->info("  {$field}: " . ($value === null ? 'NULL' : "'{$value}'"));
        }
    }
}
