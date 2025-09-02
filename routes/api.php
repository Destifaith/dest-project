<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BeachController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you may register API routes for your application. These
| routes are loaded by the RouteServiceProvider and assigned to the "api"
| middleware group. Make something great!
|
*/

// Example: GET /api/user (default from Laravel Breeze/Sanctum)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Beaches API routes
Route::prefix('beaches')->group(function () {
    Route::get('/', [BeachController::class, 'index']);      // list all beaches
    Route::post('/', [BeachController::class, 'store']);     // create a new beach
    Route::get('/{id}', [BeachController::class, 'show']);   // get one beach
    Route::put('/{id}', [BeachController::class, 'update']); // update beach
    Route::delete('/{id}', [BeachController::class, 'destroy']); // delete beach
});
