<?php

namespace App\Http\Controllers;

use App\Models\Eatery;
use App\Models\EateryMenu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EateryPublishController extends Controller
{
    /**
     * Display a listing of menus for a specific eatery
     */
    public function index(Eatery $eatery)
    {
        $menus = $eatery->menus()
            ->orderBy('menu_date', 'desc')
            ->get()
            ->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'menu_date' => $menu->menu_date->format('Y-m-d'),
                    'formatted_date' => $menu->menu_date->format('F j, Y'),
                    'source_type' => $menu->source_type,
                    'status' => $menu->status,
                    'structured_menu' => $menu->structured_menu,
                    'extras' => $menu->extras,
                    'menu_password' => $menu->menu_password,
                    'created_at' => $menu->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Eatery/Menus/Index', [
            'eatery' => [
                'id' => $eatery->id,
                'name' => $eatery->name,
            ],
            'menus' => $menus,
        ]);
    }

    /**
     * Show the form for creating a new menu
     */
    public function create(Eatery $eatery)
    {
        return Inertia::render('Eatery/Menus/Create', [
            'eatery' => [
                'id' => $eatery->id,
                'name' => $eatery->name,
            ],
        ]);
    }

    /**
     * Store a newly created menu
     */
    public function store(Request $request, Eatery $eatery)
    {
        $validated = $request->validate([
            'menu_date' => 'required|date',
            'source_type' => 'required|in:upload,manual',
            'structured_menu' => 'required|array',
            'extras' => 'nullable|array',
            'menu_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240', // 10MB max
        ]);

        try {
            $menuData = [
                'eatery_id' => $eatery->id,
                'menu_date' => $validated['menu_date'],
                'source_type' => $validated['source_type'],
                'structured_menu' => $validated['structured_menu'],
                'extras' => $validated['extras'] ?? [],
                'status' => 'published',
                'menu_password' => Str::random(8),
            ];

            // Handle file upload if present
            if ($request->hasFile('menu_file')) {
                $file = $request->file('menu_file');
                $fileName = 'menu_' . time() . '_' . $eatery->id . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('eatery_menus', $fileName, 'public');

                $menuData['source_file'] = $filePath;
                $menuData['source_type'] = 'upload';
            }

            $menu = EateryMenu::create($menuData);

            return redirect()->route('eatery.menus.show', [$eatery->id, $menu->id])
                ->with('success', 'Menu published successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to publish menu: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified menu
     */
    public function show(Eatery $eatery, EateryMenu $menu)
    {
        // Verify the menu belongs to the eatery
        if ($menu->eatery_id !== $eatery->id) {
            abort(404);
        }

        return Inertia::render('Eatery/Menus/Show', [
            'eatery' => [
                'id' => $eatery->id,
                'name' => $eatery->name,
            ],
            'menu' => [
                'id' => $menu->id,
                'menu_date' => $menu->menu_date->format('Y-m-d'),
                'formatted_date' => $menu->menu_date->format('F j, Y'),
                'source_type' => $menu->source_type,
                'source_file' => $menu->source_file,
                'structured_menu' => $menu->structured_menu,
                'extras' => $menu->extras,
                'status' => $menu->status,
                'menu_password' => $menu->menu_password,
                'created_at' => $menu->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Show the form for editing a menu
     */
    public function edit(Eatery $eatery, EateryMenu $menu)
    {
        // Verify the menu belongs to the eatery
        if ($menu->eatery_id !== $eatery->id) {
            abort(404);
        }

        return Inertia::render('Eatery/Menus/Edit', [
            'eatery' => [
                'id' => $eatery->id,
                'name' => $eatery->name,
            ],
            'menu' => [
                'id' => $menu->id,
                'menu_date' => $menu->menu_date->format('Y-m-d'),
                'source_type' => $menu->source_type,
                'structured_menu' => $menu->structured_menu,
                'extras' => $menu->extras,
                'status' => $menu->status,
            ],
        ]);
    }

    /**
     * Update the specified menu
     */
    public function update(Request $request, Eatery $eatery, EateryMenu $menu)
    {
        // Verify the menu belongs to the eatery
        if ($menu->eatery_id !== $eatery->id) {
            abort(404);
        }

        $validated = $request->validate([
            'menu_date' => 'required|date',
            'source_type' => 'required|in:upload,manual',
            'structured_menu' => 'required|array',
            'extras' => 'nullable|array',
            'menu_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        try {
            $updateData = [
                'menu_date' => $validated['menu_date'],
                'source_type' => $validated['source_type'],
                'structured_menu' => $validated['structured_menu'],
                'extras' => $validated['extras'] ?? [],
            ];

            // Handle file upload if present
            if ($request->hasFile('menu_file')) {
                // Delete old file if exists
                if ($menu->source_file) {
                    Storage::disk('public')->delete($menu->source_file);
                }

                $file = $request->file('menu_file');
                $fileName = 'menu_' . time() . '_' . $eatery->id . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('eatery_menus', $fileName, 'public');

                $updateData['source_file'] = $filePath;
                $updateData['source_type'] = 'upload';
            }

            $menu->update($updateData);

            return redirect()->route('eatery.menus.show', [$eatery->id, $menu->id])
                ->with('success', 'Menu updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update menu: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified menu
     */
    public function destroy(Eatery $eatery, EateryMenu $menu)
    {
        // Verify the menu belongs to the eatery
        if ($menu->eatery_id !== $eatery->id) {
            abort(404);
        }

        try {
            // Delete associated file if exists
            if ($menu->source_file) {
                Storage::disk('public')->delete($menu->source_file);
            }

            $menu->delete();

            return redirect()->route('eatery.menus.index', $eatery->id)
                ->with('success', 'Menu deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete menu: ' . $e->getMessage());
        }
    }

    /**
     * Get menus for public API (used by frontend EateryDetailed component)
     */
    public function getEateryMenus(Eatery $eatery)
    {
        $menus = $eatery->menus()
            ->where('status', 'published')
            ->orderBy('menu_date', 'desc')
            ->get()
            ->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'menu_date' => $menu->menu_date->format('Y-m-d'),
                    'structured_menu' => $menu->structured_menu,
                    'extras' => $menu->extras,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    /**
     * Regenerate menu password
     */
    public function regeneratePassword(Eatery $eatery, EateryMenu $menu)
    {
        // Verify the menu belongs to the eatery
        if ($menu->eatery_id !== $eatery->id) {
            abort(404);
        }

        try {
            $newPassword = $menu->generateMenuPassword();

            return response()->json([
                'success' => true,
                'message' => 'Password regenerated successfully',
                'new_password' => $newPassword
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to regenerate password'
            ], 500);
        }
    }
}
