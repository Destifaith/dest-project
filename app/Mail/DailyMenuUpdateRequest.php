<?php

namespace App\Mail;

use App\Models\Eatery;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class DailyMenuUpdateRequest extends Mailable
{
    use Queueable, SerializesModels;

    public $eatery;
    public $menuDate;
    public $signedUrl;

    public function __construct(Eatery $eatery, string $menuDate)
    {
        $this->eatery = $eatery;
        $this->menuDate = $menuDate;

        // Create a signed URL that expires in 24 hours
        $this->signedUrl = URL::temporarySignedRoute(
            'daily-menu.upload.form',
            now()->addHours(24), // Expires in 24 hours
            [
                'eatery_id' => $eatery->id,
                'date' => $menuDate
            ]
        );
    }

    public function build()
    {
        return $this->subject("Update Your Daily Menu for " . $this->menuDate)
            ->view('emails.daily-menu-update')
            ->with([
                'eatery' => $this->eatery, // Add this line
                'menuDate' => $this->menuDate, // Add this line
                'signedUrl' => $this->signedUrl,
            ]);
    }
}
