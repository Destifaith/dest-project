<?php

use App\Http\Controllers\Api\BeachController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Models\SwimmingPool;
use App\Models\Event;
use App\Http\Controllers\SpaController;
use App\Http\Controllers\GymController;
use App\Models\Spa;
use App\Models\Gym;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\MenuLoginController;
use App\Http\Controllers\Main\BeachBookingController;
use App\Http\Controllers\Main\BeachPublicController;
use App\Models\Beach;
use Torann\GeoIP\Facades\GeoIP;
use App\Http\Controllers\Main\EateryPublicController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\SwimmingPoolController;
use App\Models\Eatery;
use Illuminate\Http\Request;
use App\Http\Controllers\DailyMenuController;
use App\Http\Controllers\EateryPublishController;

// -----------------------
// Frontend main routes
// -----------------------
Route::get('/', function () {
    $beaches = Beach::with('mainImage')->get();
    $eateries = Eatery::where('status', 'approved')
        ->select('id', 'name', 'main_image', 'location', 'cuisine_type', 'price_range')
        ->get();

    return Inertia::render('Main/Home/Page', [
        'beaches' => $beaches,
        'eateries' => $eateries,
    ]);
})->name('home');

// -----------------------
// Eateries page (auto-detect country for display)
// -----------------------
Route::get('/eateries', function () {
    $ip = request()->ip();
    if ($ip === '127.0.0.1' || $ip === '::1') {
        $ip = '102.176.65.55'; // Ghana test IP
    }

    $location = geoip()->getLocation($ip);
    $country = $location->country_name ?? 'Ghana';

    $eateries = Eatery::where('status', 'approved')
        ->where('location', 'like', "%{$country}%")
        ->select('id', 'name', 'main_image', 'location', 'cuisine_type', 'price_range')
        ->get();

    return Inertia::render('Main/Eateries/Page', [
        'country' => $country,
        'eateries' => $eateries,
    ]);
})->name('eateries');

// -----------------------
// Eateries Search Page (auto-detect country + provide all countries + eateries)
// -----------------------
Route::get('/eateries-search', function () {
    $ip = request()->ip();
    if ($ip === '127.0.0.1' || $ip === '::1') {
        $ip = '102.176.65.55'; // test IP
    }

    $location = geoip()->getLocation($ip);
    $detectedCountry = $location->country_name ?? 'Ghana';

    $countries = Eatery::where('status', 'approved')
        ->select('id', 'name', 'location')
        ->get()
        ->groupBy(function ($eatery) {
            $parts = explode(',', $eatery->location ?? '');
            return trim($parts[1] ?? $eatery->location ?? 'Unknown');
        })
        ->map(function ($eateries, $countryName) {
            return [
                'name' => $countryName,
                'eateries' => $eateries->pluck('name')->toArray(),
            ];
        })
        ->values();

    return Inertia::render('Main/Eateries/Components/EateriesSearch', [
        'countries' => $countries,
        'detectedCountry' => $detectedCountry,
    ]);
})->name('eateries.search');

// -----------------------
// Beaches page (auto-detect country for display)
// -----------------------
Route::get('/beach', function () {
    $ip = request()->ip();
    if ($ip === '127.0.0.1' || $ip === '::1') {
        $ip = '102.176.65.55'; // Ghana test IP
    }

    $location = geoip()->getLocation($ip);
    $country = $location->country_name ?? 'Ghana';

    $beaches = Beach::with('mainImage')
        ->where('location', 'like', "%{$country}%")
        ->get();

    return Inertia::render('Main/Beach/Page', [
        'country' => $country,
        'beaches' => $beaches,
    ]);
})->name('beach');

// -----------------------
// Beach Search Page (auto-detect country + provide all countries + beaches)
// -----------------------
Route::get('/beach-search', function () {
    $ip = request()->ip();
    if ($ip === '127.0.0.1' || $ip === '::1') {
        $ip = '102.176.65.55'; // test IP
    }

    $location = geoip()->getLocation($ip);
    $detectedCountry = $location->country_name ?? 'Ghana';

    $countries = Beach::with('mainImage')->get()
        ->groupBy(function ($beach) {
            $parts = explode(',', $beach->location ?? '');
            return trim($parts[1] ?? $beach->location ?? 'Unknown');
        })
        ->map(function ($beaches, $countryName) {
            return [
                'name' => $countryName,
                'beaches' => $beaches->pluck('name')->toArray(),
            ];
        })
        ->values();

    return Inertia::render('Main/Beach/Components/BeachSearch', [
        'countries' => $countries,
        'detectedCountry' => $detectedCountry,
    ]);
})->name('beach.search');

// -----------------------
// Admin welcome page
// -----------------------
Route::get('/admin/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('admin.welcome');

// -----------------------
// Dashboard
// -----------------------
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// -----------------------
// Profile
// -----------------------
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// -----------------------
// Google Auth
// -----------------------
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

// -----------------------
// Beaches routes
// -----------------------
Route::get('/dashboard/entertainment/beaches/add', function () {
    return Inertia::render('Dashboard/Entertainment/Beaches/Add/Beaches');
})->name('beaches.add');

Route::get('/dashboard/entertainment/beaches/manage', function (Request $request) {
    $beaches = Beach::query()
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Entertainment/Beaches/Manage/ManageBeaches', [
        'beaches' => $beaches,
        'filters' => $request->only(['search']),
    ]);
})->name('beaches.manage');

Route::prefix('beaches')->name('beaches.')->group(function () {
    Route::post('/', [BeachController::class, 'store'])->name('store');
    Route::get('/{beach}', [BeachController::class, 'show'])->name('show');
    Route::get('/{beach}/edit', [BeachController::class, 'edit'])->name('edit');
    Route::put('/{beach}', [BeachController::class, 'update'])->name('update');
    Route::delete('/{beach}', [BeachController::class, 'destroy'])->name('destroy');
    Route::get('/all', [BeachController::class, 'index'])->name('all');
});

Route::get('/dashboard/entertainment/beaches/{beach}/edit', function (Beach $beach) {
    return Inertia::render('Dashboard/Entertainment/Beaches/Manage/EditBeach', [
        'beach' => $beach->load(['mainImage', 'galleryImages']),
    ]);
})->name('beaches.edit');

Route::get('/beach-detailed', [BeachPublicController::class, 'show'])->name('beach.detailed');

Route::get('/beach-booking', [BeachBookingController::class, 'show'])->name('beach.booking');

// -----------------------
// Eateries routes
// -----------------------
Route::get('/dashboard/food/eateries/add', function () {
    return Inertia::render('Dashboard/Food/Eateries/Add/Eateries');
})->name('eateries.add');

Route::get('/dashboard/food/eateries/manage', function (Request $request) {
    $eateries = Eatery::query()
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Food/Eateries/Manage/ManageEateries', [
        'eateries' => $eateries,
        'filters' => $request->only(['search']),
    ]);
})->name('eateries.manage');

Route::get('/dashboard/food/eateries/{eatery}/edit', function (Eatery $eatery) {
    return Inertia::render('Dashboard/Food/Eateries/Manage/EditEatery', [
        'eatery' => $eatery,
    ]);
})->name('eateries.edit');

Route::prefix('eateries')->name('eateries.')->group(function () {
    Route::post('/', [RestaurantController::class, 'store'])->name('store');
    Route::get('/{eatery}', [RestaurantController::class, 'show'])->name('show');
    Route::get('/{eatery}/edit', [RestaurantController::class, 'edit'])->name('edit');
    Route::put('/{eatery}', [RestaurantController::class, 'update'])->name('update');
    Route::delete('/{eatery}', [RestaurantController::class, 'destroy'])->name('destroy');
    Route::get('/all', [RestaurantController::class, 'index'])->name('all');
});

// -----------------------
// Cart routes
// -----------------------
Route::middleware(['web'])->group(function () {
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
});


// -----------------------
// Eateries public routes
// -----------------------
Route::get('/eatery-detailed', [EateryPublicController::class, 'show'])->name('eatery.detailed');

// -----------------------
// Swimming Pool Routes
// -----------------------
Route::get('/dashboard/entertainment/pool/add', function () {
    return Inertia::render('Dashboard/Entertainment/Pool/Add/SwimmingPools');
})->name('swimming-pools.add');

Route::get('/dashboard/entertainment/pool/manage', function (Request $request) {
    $pools = SwimmingPool::query()
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Entertainment/Pool/Manage/ManagePool', [
        'pools' => $pools,
        'filters' => $request->only(['search']),
    ]);
})->name('swimming-pools.manage');

Route::get('/dashboard/entertainment/pool/{pool}/edit', function (SwimmingPool $pool) {
    return Inertia::render('Dashboard/Entertainment/Pool/Manage/EditPool', [
        'pool' => $pool,
    ]);
})->name('swimming-pools.edit');

Route::prefix('swimming-pools')->name('swimming-pools.')->group(function () {
    Route::post('/', [SwimmingPoolController::class, 'store'])->name('store');
    Route::put('/{swimmingPool}', [SwimmingPoolController::class, 'update'])->name('update');
    Route::delete('/{swimmingPool}', [SwimmingPoolController::class, 'destroy'])->name('destroy');
    Route::get('/all', [SwimmingPoolController::class, 'index'])->name('all');
    Route::get('/{swimmingPool}', [SwimmingPoolController::class, 'show'])->name('show');
});

// -----------------------
// Events Routes
// -----------------------
Route::get('/dashboard/entertainment/events/add', function () {
    return Inertia::render('Dashboard/Entertainment/Events/Add/Events');
})->name('events.add');

Route::get('/dashboard/entertainment/events/manage', function (Request $request) {
    $events = Event::query()
        ->when($request->search, function ($query, $search) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('event_type', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Entertainment/Events/Manage/ManageEvents', [
        'events' => $events,
        'filters' => $request->only(['search']),
    ]);
})->name('events.manage');

Route::get('/dashboard/entertainment/events/{event}/edit', function (Event $event) {
    return Inertia::render('Dashboard/Entertainment/Events/Manage/EditEvent', [
        'event' => $event,
    ]);
})->name('events.edit');

Route::get('/dashboard/entertainment/events/{event}', [EventController::class, 'show'])->name('events.show');

Route::prefix('events')->name('events.')->group(function () {
    Route::get('/', [EventController::class, 'index'])->name('index');
    Route::post('/', [EventController::class, 'store'])->name('store');
    Route::put('/{event}', [EventController::class, 'update'])->name('update');
    Route::delete('/{event}', [EventController::class, 'destroy'])->name('destroy');
});

// -----------------------
// Gym Routes
// -----------------------
Route::get('/dashboard/entertainment/gym/add', function () {
    return Inertia::render('Dashboard/Entertainment/Gym/Add/AddGym');
})->name('gyms.add');

Route::get('/dashboard/entertainment/gym/manage', function (Request $request) {
    $gyms = Gym::query()
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Entertainment/Gym/Manage/ManageGym', [
        'gyms' => $gyms,
        'filters' => $request->only(['search']),
    ]);
})->name('gyms.manage');

Route::get('/dashboard/entertainment/gym/{gym}/edit', function (Gym $gym) {
    return Inertia::render('Dashboard/Entertainment/Gym/Manage/EditGym', [
        'gym' => $gym,
    ]);
})->name('gyms.edit');

Route::prefix('gyms')->name('gyms.')->group(function () {
    Route::post('/', [GymController::class, 'store'])->name('store');
    Route::put('/{gym}', [GymController::class, 'update'])->name('update');
    Route::delete('/{gym}', [GymController::class, 'destroy'])->name('destroy');
    Route::get('/all', [GymController::class, 'index'])->name('all');
    Route::get('/{gym}', [GymController::class, 'show'])->name('show');
});

// Gym API routes (for React component)
Route::get('/api/gyms', [GymController::class, 'index']);
Route::get('/api/gyms/search', [GymController::class, 'search']);
Route::get('/api/gyms/test', [GymController::class, 'test']);
Route::get('/api/gyms/all', [GymController::class, 'getAllGyms']);
// Frontend routes (public facing)
Route::get('/gyms', [GymController::class, 'frontendIndex'])->name('gyms.frontend.index');
Route::get('/gyms/{gym}', [GymController::class, 'frontendShow'])->name('gyms.frontend.show');
//Route::get('/gyms', [GymController::class, 'index']);
// Gym category API route
Route::get('/api/gyms/category/{category}', [GymController::class, 'getGymsByCategory']);

// routes/web.php
Route::get('/gym-booking', [GymController::class, 'booking'])->name('gym.booking');

// Spa Routes
// -----------------------
Route::get('/dashboard/entertainment/spa/add', function () {
    return Inertia::render('Dashboard/Entertainment/Spa/Add/AddSpa');
})->name('spas.add');

Route::get('/dashboard/entertainment/spa/manage', function (Request $request) {
    $spas = Spa::query()
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Dashboard/Entertainment/Spa/Manage/ManageSpa', [
        'spas' => $spas,
        'filters' => $request->only(['search']),
    ]);
})->name('spas.manage');

Route::get('/dashboard/entertainment/spa/{spa}/edit', function (Spa $spa) {
    return Inertia::render('Dashboard/Entertainment/Spa/Manage/EditSpa', [
        'spa' => $spa,
    ]);
})->name('spas.edit');

Route::prefix('spas')->name('spas.')->group(function () {
    Route::post('/', [SpaController::class, 'store'])->name('store');
    Route::put('/{spa}', [SpaController::class, 'update'])->name('update');
    Route::delete('/{spa}', [SpaController::class, 'destroy'])->name('destroy');
    Route::get('/all', [SpaController::class, 'index'])->name('all');
    Route::get('/{spa}', [SpaController::class, 'show'])->name('show');
});

Route::get('/menu/login/{eatery_id?}', [MenuLoginController::class, 'showLoginForm'])
    ->name('menu.login');

Route::post('/menu/login', [MenuLoginController::class, 'login'])
    ->name('menu.login.submit');

Route::post('/menu/logout', [MenuLoginController::class, 'logout'])
    ->name('menu.logout');

// Update your existing route to use menu auth
Route::get('/eateries/{eatery_id}/daily-menu/{date}', [DailyMenuController::class, 'showUploadForm'])
    ->name('daily-menu.upload.form')
    ->middleware('menu.auth');
// Keep your other routes the same
Route::post('/daily-menu/extract', [DailyMenuController::class, 'extract'])->name('daily-menu.extract');
Route::post('/daily-menu/store', [DailyMenuController::class, 'store'])->name('daily-menu.store');



// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    // Eatery Menu Management Routes
    Route::prefix('eateries/{eatery}')->group(function () {
        Route::get('/menus', [EateryPublishController::class, 'index'])->name('eatery.menus.index');
        Route::get('/menus/create', [EateryPublishController::class, 'create'])->name('eatery.menus.create');
        Route::post('/menus', [EateryPublishController::class, 'store'])->name('eatery.menus.store');
        Route::get('/menus/{menu}', [EateryPublishController::class, 'show'])->name('eatery.menus.show');
        Route::get('/menus/{menu}/edit', [EateryPublishController::class, 'edit'])->name('eatery.menus.edit');
        Route::put('/menus/{menu}', [EateryPublishController::class, 'update'])->name('eatery.menus.update');
        Route::delete('/menus/{menu}', [EateryPublishController::class, 'destroy'])->name('eatery.menus.destroy');
        Route::post('/menus/{menu}/regenerate-password', [EateryPublishController::class, 'regeneratePassword'])->name('eatery.menus.regenerate-password');
    });
});

// Public API route for frontend (no auth required)
Route::get('/api/eateries/{eatery}/menus', [EateryPublishController::class, 'getEateryMenus'])->name('api.eatery.menus');



Route::get('/eatery-reservation', [EateryPublicController::class, 'booking'])->name('eatery.reservation');




////////////////////////////////////////////////newly added codes ///////////////////////////////////////
////////resturant front end //////////////////////////////////////////////////////////////////////
// routes/web.php
Route::get('/restaurants', [RestaurantController::class, 'frontendIndex'])->name('restaurants.index');
//////////////////////////////////////////////////////////////end of newly added codes///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////gymn frontend///////////////////////////////////

// Frontend Spa Routes (Add these AFTER all other spa routes)
//Route::get('/spa', [SpaController::class, 'frontendIndex'])->name('spa.frontend.index');
// Main spa listing page
Route::get('/spa', function () {
    $spas = \App\Models\Spa::where('status', 'active')->get();

    return inertia('Main/Spa/Page', [
        'spas' => $spas
    ]);
});

// // Spa detail page
// Route::get('/spa/{id}', function ($id) {
//     $spa = \App\Models\Spa::where('status', 'active')->find($id);

//     if (!$spa) {
//         abort(404);
//     }

//     return inertia('Main/Spa/Detail', [
//         'spa' => $spa
//     ]);
// });

// In routes/web.php
Route::get('/spa/{spa}', [SpaController::class, 'frontendShow'])->name('spa.detail');

Route::get('/spa-booking', [SpaController::class, 'booking'])->name('spa.booking');


Route::get('/spa-simple', function () {
    return "SIMPLE SPA ROUTE WORKING!";
});
Route::get('/inertia-test', function () {
    return inertia('Test', ['message' => 'Inertia is working!']);
});
Route::get('/spas-page', function () {
    $spas = \App\Models\Spa::where('status', 'active')->get();
    return inertia('Main/Spa/Page', ['spas' => $spas]);
});

require __DIR__ . '/auth.php';
require __DIR__ . '/food.php';
