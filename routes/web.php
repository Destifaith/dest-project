<?php

use App\Http\Controllers\Api\BeachController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;

// Welcome page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})
    // ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Google Auth
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

// -----------------------
// Beaches routes
// -----------------------

// Add Beach page
Route::get('/dashboard/entertainment/beaches/add', function () {
    return Inertia::render('Dashboard/Entertainment/Beaches/Add/Beaches');
})->name('beaches.add');

// Manage Beaches page with search & pagination
Route::get('/dashboard/entertainment/beaches/manage', function () {
    $beaches = \App\Models\Beach::query()
        ->when(request('search'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Entertainment/Beaches/Manage/ManageBeaches', [
        'beaches' => $beaches,
    ]);
})->name('beaches.manage');

// Beaches API & actions
Route::prefix('beaches')->name('beaches.')->group(function () {
    // Store a new beach
    Route::post('/', [BeachController::class, 'store'])->name('store');

    // Show a single beach
    Route::get('/{beach}', [BeachController::class, 'show'])->name('show');

    // Edit beach page
    Route::get('/{beach}/edit', [BeachController::class, 'edit'])->name('edit');

    // Update a beach
    Route::put('/{beach}', [BeachController::class, 'update'])->name('update');

    // Delete a beach
    Route::delete('/{beach}', [BeachController::class, 'destroy'])->name('destroy');

    // Fetch all beaches (optional API)
    Route::get('/all', [BeachController::class, 'index'])->name('all');
});
// Edit Beach page
Route::get('/dashboard/entertainment/beaches/{beach}/edit', function (\App\Models\Beach $beach) {
    return Inertia::render('Dashboard/Entertainment/Beaches/Manage/EditBeach', [
        'beach' => $beach->load(['mainImage', 'galleryImages']),
    ]);
})->name('beaches.edit');

require __DIR__ . '/auth.php';
