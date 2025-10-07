<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Models\Beach;
use Inertia\Inertia;

class BeachPublicController extends Controller
{
    public function show()
    {
        // Get the beach ID from the query string
        $id = request()->query('id');

        // Fetch the beach with its images
        $beach = Beach::with(['mainImage', 'galleryImages'])->findOrFail($id);

        // Render the detailed beach page
        return Inertia::render('Main/Beach/BeachDetailed', [
            'beach' => $beach,
        ]);
    }
}
