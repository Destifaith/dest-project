<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class MenuAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!Session::get('menu.authenticated')) {
            return redirect()->route('menu.login', [
                'eatery_id' => $request->route('eatery_id'),
                'date' => $request->route('date')
            ]);
        }

        // Check if session is for the correct eatery
        $sessionEateryId = Session::get('menu.eatery_id');
        $routeEateryId = $request->route('eatery_id');

        if ($sessionEateryId != $routeEateryId) {
            Session::forget('menu.authenticated');
            Session::forget('menu.eatery_id');
            return redirect()->route('menu.login', [
                'eatery_id' => $routeEateryId,
                'date' => $request->route('date')
            ]);
        }

        return $next($request);
    }
}
