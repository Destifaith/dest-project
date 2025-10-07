<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckRawPassword extends Command
{
    protected $signature = 'debug:raw-password';
    protected $description = 'Check raw database value for password';

    public function handle()
    {
        $result = DB::table('eateries')
            ->where('name', 'Golden Gateway Hotel')
            ->select('id', 'name', 'menu_password')
            ->first();

        if (!$result) {
            $this->error("Eatery not found!");
            return;
        }

        $this->info("Raw database values:");
        $this->info("ID: {$result->id}");
        $this->info("Name: {$result->name}");
        $this->info("Menu Password: '{$result->menu_password}'");
        $this->info("Password length: " . strlen($result->menu_password ?? ''));
        $this->info("Is null: " . (is_null($result->menu_password) ? 'YES' : 'NO'));
        $this->info("Is empty: " . (empty($result->menu_password) ? 'YES' : 'NO'));
    }
}
