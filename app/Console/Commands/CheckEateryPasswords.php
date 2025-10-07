<?php

namespace App\Console\Commands;

use App\Models\Eatery;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CheckEateryPasswords extends Command
{
    protected $signature = 'eatery:check-passwords {name?}';
    protected $description = 'Check and generate missing passwords for eateries';

    public function handle()
    {
        $name = $this->argument('name');

        if ($name) {
            $eateries = Eatery::where('name', 'like', "%{$name}%")->get();
        } else {
            $eateries = Eatery::where('has_daily_specials', true)->get();
        }

        $this->info("Checking {$eateries->count()} eateries...");

        foreach ($eateries as $eatery) {
            $this->line("---");
            $this->info("Eatery: {$eatery->name}");
            $this->info("ID: {$eatery->id}");
            $this->info("Current Password: " . ($eatery->menu_password ?: 'NULL'));

            if (!$eatery->menu_password) {
                $newPassword = Str::random(8);
                $eatery->update(['menu_password' => $newPassword]);
                $this->warn("🔑 Generated new password: {$newPassword}");
            } else {
                $this->info("✅ Password exists: {$eatery->menu_password}");
            }
        }

        $this->line("---");
        $this->info("Password check complete!");
    }
}
