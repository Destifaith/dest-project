<?php

namespace App\Console\Commands;

use App\Models\Eatery;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class DebugPassword extends Command
{
    protected $signature = 'debug:password';
    protected $description = 'Debug why password is empty';

    public function handle()
    {
        $eatery = Eatery::where('name', 'Golden Gateway Hotel')->first();

        if (!$eatery) {
            $this->error("Eatery not found!");
            return;
        }

        $this->info("Eatery: {$eatery->name}");
        $this->info("ID: {$eatery->id}");
        $this->info("Current Password: '" . ($eatery->menu_password ?: 'NULL') . "'");
        $this->info("Password length: " . strlen($eatery->menu_password ?? ''));

        // Try to generate password
        $newPassword = Str::random(8);
        $this->info("New password to set: '{$newPassword}'");

        $result = $eatery->update(['menu_password' => $newPassword]);
        $this->info("Update result: " . ($result ? 'SUCCESS' : 'FAILED'));

        // Reload and check
        $eatery->refresh();
        $this->info("After update - Password: '{$eatery->menu_password}'");
        $this->info("After update - Password length: " . strlen($eatery->menu_password ?? ''));
    }
}
