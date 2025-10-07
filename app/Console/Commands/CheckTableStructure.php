<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckTableStructure extends Command
{
    protected $signature = 'debug:table-structure';
    protected $description = 'Check eateries table structure';

    public function handle()
    {
        $table = 'eateries';

        $this->info("Checking table structure for: {$table}");

        // Check if column exists
        if (!Schema::hasColumn($table, 'menu_password')) {
            $this->error("❌ menu_password column does not exist!");
            return;
        }

        $this->info("✅ menu_password column exists");

        // Get column details
        $columns = DB::select("DESCRIBE {$table}");
        foreach ($columns as $column) {
            if ($column->Field === 'menu_password') {
                $this->info("Column details:");
                $this->info("  Field: {$column->Field}");
                $this->info("  Type: {$column->Type}");
                $this->info("  Null: {$column->Null}");
                $this->info("  Default: {$column->Default}");
            }
        }

        // Check current values
        $this->info("\nCurrent values in menu_password:");
        $values = DB::table($table)
            ->select('id', 'name', 'menu_password')
            ->whereNotNull('menu_password')
            ->orWhere('menu_password', '!=', '')
            ->get();

        if ($values->isEmpty()) {
            $this->info("No non-empty password values found");
        } else {
            foreach ($values as $value) {
                $this->info("ID: {$value->id}, Name: {$value->name}, Password: '{$value->menu_password}'");
            }
        }
    }
}
