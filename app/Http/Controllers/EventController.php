<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::query()
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%");
            })
            ->orderBy('start_date', 'asc')
            ->get();

        // Always return an Inertia response for Inertia requests
        return Inertia::render('Dashboard/Events/Manage/ManageEvents', [
            'events' => $events,
            'filters' => $request->only(['search']),
        ]);
    }

    // Add a separate API method if you need JSON responses
    public function apiIndex(Request $request)
    {
        $events = Event::query()
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%");
            })
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'events' => $events
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Events/Add/Events');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'event_type' => 'required|string',
            'organizer' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string',
            'website' => 'nullable|url',
            'price' => 'nullable|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'main_image' => 'required|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive,sold_out,cancelled',
            'tags' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Handle main image upload
        $mainImagePath = $request->file('main_image')->store('events', 'public');

        // Handle gallery images upload
        $galleryImagesPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryImagesPaths[] = $image->store('events/gallery', 'public');
            }
        }

        $event = Event::create([
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'event_type' => $request->event_type,
            'organizer' => $request->organizer,
            'contact_email' => $request->contact_email,
            'contact_phone' => $request->contact_phone,
            'website' => $request->website,
            'price' => $request->price,
            'capacity' => $request->capacity,
            'main_image' => $mainImagePath,
            'gallery_images' => $galleryImagesPaths,
            'status' => $request->status,
            'tags' => $request->tags,
        ]);

        return redirect()->route('events.manage')
            ->with('success', 'Event created successfully!');
    }

    public function show(Event $event)
    {
        return Inertia::render('Dashboard/Events/Show/EventShow', [
            'event' => $event,
        ]);
    }

    public function edit(Event $event)
    {
        return Inertia::render('Dashboard/Events/Edit/EditEvent', [
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'event_type' => 'required|string',
            'organizer' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string',
            'website' => 'nullable|url',
            'price' => 'nullable|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive,sold_out,cancelled',
            'tags' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $request->except(['main_image', 'gallery_images']);

        // Handle main image upload if provided
        if ($request->hasFile('main_image')) {
            // Delete old main image
            if ($event->main_image) {
                Storage::disk('public')->delete($event->main_image);
            }

            // Store new main image
            $data['main_image'] = $request->file('main_image')->store('events', 'public');
        }

        // Handle gallery images
        if ($request->has('existing_gallery_images')) {
            $existingImages = json_decode($request->existing_gallery_images, true);

            // Delete removed images
            if ($event->gallery_images) {
                foreach ($event->gallery_images as $oldImage) {
                    if (!in_array($oldImage, $existingImages)) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
            }

            $data['gallery_images'] = $existingImages;
        }

        // Handle new gallery images upload if provided
        if ($request->hasFile('gallery_images')) {
            $galleryImagesPaths = $data['gallery_images'] ?? [];

            foreach ($request->file('gallery_images') as $image) {
                $galleryImagesPaths[] = $image->store('events/gallery', 'public');
            }
            $data['gallery_images'] = $galleryImagesPaths;
        }

        $event->update($data);

        return redirect()->route('events.manage')
            ->with('success', 'Event updated successfully!');
    }

    public function destroy(Event $event)
    {
        // Delete main image
        if ($event->main_image) {
            Storage::disk('public')->delete($event->main_image);
        }

        // Delete gallery images
        if ($event->gallery_images) {
            foreach ($event->gallery_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $event->delete();

        // If it's an AJAX request (from your React component), return JSON
        if (request()->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('events.manage')
            ->with('success', 'Event deleted successfully!');
    }
}
