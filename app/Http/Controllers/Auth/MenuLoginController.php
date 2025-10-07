<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Eatery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class MenuLoginController extends Controller
{
    public function showLoginForm(Request $request, $eatery_id = null)
    {
        $eatery = null;
        if ($eatery_id) {
            $eatery = Eatery::find($eatery_id);
        }

        return view('auth.menu-login', [
            'eatery' => $eatery,
            'eatery_id' => $eatery_id,
            'date' => $request->get('date', now()->format('Y-m-d'))
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'eatery_name' => 'required|string',
            'password' => 'required|string',
            'eatery_id' => 'required|exists:eateries,id',
            'date' => 'required|date',
        ]);

        // Find eatery by ID and name
        $eatery = Eatery::where('id', $request->eatery_id)
            ->where('name', $request->eatery_name)
            ->first();

        if (!$eatery) {
            return back()->withErrors([
                'eatery_name' => 'Eatery not found with this name.',
            ])->withInput();
        }

        // Check password (plain text comparison)
        if ($eatery->menu_password !== $request->password) {
            return back()->withErrors([
                'password' => 'Invalid password for this eatery.',
            ])->withInput();
        }

        // Store menu authentication in session
        Session::put('menu.authenticated', true);
        Session::put('menu.eatery_id', $eatery->id);
        Session::put('menu.authenticated_at', now());

        // Redirect to upload form
        return redirect()->route('daily-menu.upload.form', [
            'eatery_id' => $eatery->id,
            'date' => $request->date
        ]);
    }

    public function logout(Request $request)
    {
        Session::forget('menu.authenticated');
        Session::forget('menu.eatery_id');
        Session::forget('menu.authenticated_at');

        return redirect()->route('menu.login')->with('status', 'Logged out successfully!');
    }
}
