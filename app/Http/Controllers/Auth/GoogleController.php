<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Exception;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(), // Store Google avatar URL
                    'password' => bcrypt(Str::random(16)), // Random password
                    'remember_token' => Str::random(60),    // optional
                ]
            );

            Auth::login($user);

            // Redirect based on role
            if ($user->role === 'worker') {
                return redirect()->route('cleaner.dashboard');
            }

            return redirect()->route('host.dashboard');
        } catch (Exception $e) {
            // On error, send user back to login with error flash message
            return redirect()->route('login')->with('error', 'Google login failed. Please try again.');
        }
    }
}
