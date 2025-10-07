<?php

namespace App\Console\Commands;

use App\Mail\DailyMenuUpdateRequest;
use App\Models\Eatery;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendDailyMenuEmails extends Command
{
    protected $signature = 'menu:daily-emails';
    protected $description = 'Send daily menu update emails to eateries';

    public function handle()
    {
        $today = now()->format('Y-m-d');

        $eateries = Eatery::approved()
            ->where('has_daily_specials', true)
            ->whereNotNull('daily_specials_email')
            ->get();

        $this->info("Found {$eateries->count()} eateries to process...");

        $sentCount = 0;

        foreach ($eateries as $eatery) {
            $this->line("--- Processing: {$eatery->name} ---");

            // Skip if already uploaded today
            if ($eatery->dailyMenus()->where('menu_date', $today)->exists()) {
                $this->info("⏭️ Skipped: Already uploaded today");
                continue;
            }

            // Check and generate password
            if (!$eatery->menu_password) {
                $this->warn("⚠️ No password found, generating one...");
                $eatery->update(['menu_password' => \Illuminate\Support\Str::random(8)]);
                $eatery = $eatery->fresh(); // Reload fresh data
            }

            $this->info("🔑 Password: {$eatery->menu_password}");
            $this->info("📧 Email: {$eatery->daily_specials_email}");

            try {
                Mail::to($eatery->daily_specials_email)
                    ->send(new \App\Mail\DailyMenuUpdateRequest($eatery, $today));

                $sentCount++;
                $this->info("✅ Email sent successfully!");

                sleep(1);
            } catch (\Exception $e) {
                $this->error("❌ Failed: " . $e->getMessage());
            }
        }

        $this->info("\n📊 Summary: {$sentCount} emails sent successfully");
    }
}
