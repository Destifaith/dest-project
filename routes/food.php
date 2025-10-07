<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestaurantController;
use App\Models\Restaurant;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\EateryController;
use App\Models\Eatery;

// Restaurant Management Routes
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Display routes
Route::prefix('/dashboard/food/restaurants')->name('restaurants.')->group(function () {

    // Add restaurant page
    Route::get('/add', function () {
        return Inertia::render('Dashboard/Food/Restaurants/Add/Restaurants');
    })->name('add');

    // Manage restaurants page
    Route::get('/manage', function (Request $request) {
        $restaurants = Restaurant::withCount('awards')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('cuisine_type', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard/Food/Restaurants/Manage/RestaurantsManage', [
            'restaurants' => $restaurants,
            'filters' => $request->only(['search', 'status']),
        ]);
    })->name('manage');

    // Edit restaurant page
    Route::get('/{restaurant}/edit', function (Restaurant $restaurant) {
        $restaurant->load('awards');

        return Inertia::render('Dashboard/Food/Restaurants/Manage/EditRestaurant', [
            'restaurant' => $restaurant,
        ]);
    })->name('edit');

    // View restaurant page
    Route::get('/{restaurant}', function (Restaurant $restaurant) {
        $restaurant->load('awards');

        return Inertia::render('Dashboard/Food/Restaurants/Manage/ShowRestaurant', [
            'restaurant' => $restaurant,
        ]);
    })->name('show');
});

// API routes for Restaurant CRUD operations
Route::prefix('restaurants')->name('restaurants.')->group(function () {
    // Store new restaurant
    Route::post('/', [RestaurantController::class, 'store'])->name('store');

    // Update restaurant
    Route::put('/{restaurant}', [RestaurantController::class, 'update'])->name('update');

    // Delete restaurant
    Route::delete('/{restaurant}', [RestaurantController::class, 'destroy'])->name('destroy');

    // Get all restaurants (API endpoint)
    Route::get('/all', [RestaurantController::class, 'index'])->name('all');

    // Show single restaurant (API endpoint)
    Route::get('/{restaurant}', [RestaurantController::class, 'show'])->name('show.api');

    // Status management routes
    Route::patch('/{restaurant}/status', [RestaurantController::class, 'updateStatus'])->name('update-status');
    Route::patch('/bulk/status', [RestaurantController::class, 'bulkUpdateStatus'])->name('bulk-update-status');
    Route::delete('/bulk/delete', [RestaurantController::class, 'bulkDelete'])->name('bulk-delete');
});

///////////////////////////////////////////////////////////////////////////////////////////////////////

// Route::resource('eateries', EateryController::class);
Route::post('/eateries/{eatery}/status', [EateryController::class, 'updateStatus'])->name('eateries.status');

// Eatery management routes - Updated to match dashboard structure
Route::prefix('dashboard/food/eateries')->name('eateries.')->group(function () {

    // Manage eateries page
    Route::get('/manage', function (Request $request) {
        $eateries = Eatery::when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%")
                ->orWhere('cuisine_type', 'like', "%{$search}%");
        })
            ->when($request->status, function ($query, $status) {
                if ($status === 'approved') {
                    $query->where('status', 'approved');
                } elseif ($status === 'pending') {
                    $query->where('status', 'pending');
                } elseif ($status === 'rejected') {
                    $query->where('status', 'rejected');
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard/Food/Eateries/Manage/EateriesManage', [
            'eateries' => $eateries,
            'filters' => $request->only(['search', 'status']),
        ]);
    })->name('manage');

    // Add new eatery page (your existing route)
    Route::get('/add', function () {
        return Inertia::render('Dashboard/Food/Eateries/Add/Eateries');
    })->name('add');

    // Edit eatery page
    Route::get('/{eatery}/edit', function (Eatery $eatery) {
        return Inertia::render('Dashboard/Food/Eateries/Manage/EditEatery', [
            'eatery' => $eatery,
        ]);
    })->name('edit');

    // View eatery page
    Route::get('/{eatery}', function (Eatery $eatery) {
        return Inertia::render('Dashboard/Food/Eateries/Manage/ShowEatery', [
            'eatery' => $eatery,
        ]);
    })->name('show');

    // Store new eatery (form submission)
    Route::post('/add', [EateryController::class, 'store'])->name('store');

    // Update eatery
    Route::put('/{eatery}', [EateryController::class, 'update'])->name('update');

    // Delete eatery
    Route::delete('/{eatery}', [EateryController::class, 'destroy'])->name('destroy');

    // Status management
    Route::patch('/{eatery}/status', [EateryController::class, 'updateStatus'])->name('update-status');
});

// API routes for Eatery CRUD operations (keep this separate)
Route::prefix('api/eateries')->name('eateries.api.')->group(function () {
    // Store new eatery
    Route::post('/', [EateryController::class, 'store'])->name('store');

    // Update eatery
    Route::put('/{eatery}', [EateryController::class, 'update'])->name('update');
    // Add search route
    Route::get('/search', [EateryController::class, 'search'])->name('search');

    // Delete eatery
    Route::delete('/{eatery}', [EateryController::class, 'destroy'])->name('destroy');

    // Get all eateries (API endpoint)
    //Route::get('/all', [EateryController::class, 'index'])->name('all');
    Route::get('/all', [EateryController::class, 'apiIndex'])->name('all');


    // Show single eatery (API endpoint)
    Route::get('/{eatery}', [EateryController::class, 'show'])->name('show');

    // Status management routes
    Route::patch('/{eatery}/status', [EateryController::class, 'updateStatus'])->name('update-status');
    Route::patch('/bulk/status', [EateryController::class, 'bulkUpdateStatus'])->name('bulk-update-status');
    Route::delete('/bulk/delete', [EateryController::class, 'bulkDelete'])->name('bulk-delete');
});
