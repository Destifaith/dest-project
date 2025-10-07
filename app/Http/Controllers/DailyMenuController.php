<?php

namespace App\Http\Controllers;

use App\Models\Eatery;
use App\Models\EateryMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DailyMenuController extends Controller
{
    public function showUploadForm(Request $request, $eatery_id, $date)
    {
        // Remove Auth::check() - now handled by menu.auth middleware
        $eatery = Eatery::findOrFail($eatery_id);

        $today = now()->format('Y-m-d');
        if ($date !== $today) {
            return redirect()->back()->withErrors([
                'date' => 'You can only upload the menu for today (' . $today . ').'
            ]);
        }

        return Inertia::render('Dashboard/Food/Eateries/Menu/DailyMenuUpload', [
            'eatery' => $eatery,
            'menuDate' => $date,
        ]);
    }

    public function extract(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png',
            'eatery_id' => 'required|exists:eateries,id',
            'menu_date' => 'required|date',
        ]);

        $validator->after(function ($validator) use ($request) {
            $today = now()->format('Y-m-d');
            if ($request->menu_date !== $today) {
                $validator->errors()->add('menu_date', 'The menu date must be today (' . $today . ').');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $eateryId = $request->input('eatery_id');
        $menuDate = $request->input('menu_date');

        try {
            $relativePath = $file->storeAs('temp', uniqid() . '_' . $file->getClientOriginalName(), 'local');
            $fullPath = Storage::disk('local')->path($relativePath);

            $sourceType = $file->getMimeType() === 'application/pdf' ? 'pdf' : 'image';

            $extractedText = $this->extractTextFromSource($fullPath, $sourceType);
            $structuredMenu = $this->parseMenuText($extractedText);

            Log::info('✅ Extracted structured menu', [
                'eatery_id' => $eateryId,
                'menu_date' => $menuDate,
                'menu' => $structuredMenu
            ]);

            Storage::disk('local')->delete($relativePath);

            return response()->json([
                'extracted_text' => $extractedText,
                'structured_menu' => $structuredMenu,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Menu extraction failed', [
                'eatery_id' => $eateryId,
                'menu_date' => $menuDate,
                'error' => $e->getMessage(),
                'file_path' => $fullPath ?? 'unknown',
            ]);

            return response()->json([
                'message' => 'Extraction failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'eatery_id' => 'required|exists:eateries,id',
            'menu_date' => 'required|date|date_equals:' . now()->format('Y-m-d'),
            'source_type' => 'required|in:pdf,image',
            'source_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'extracted_text' => 'required|string',
            'structured_menu' => 'required|array',
            'extras' => 'nullable|array',
            'extras.*.name' => 'sometimes|string|max:255',
            'extras.*.price' => 'sometimes|string|max:50',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $file = $request->file('source_file');
        $filename = 'eatery_' . $request->eatery_id . '_' . $request->menu_date . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs('eateries/menus', $filename, 'public');

        // Handle extras - ensure it's properly formatted
        $extras = $request->extras;
        if (is_array($extras)) {
            // Filter out any empty extras
            $extras = array_filter($extras, function ($extra) {
                return !empty($extra['name']) || !empty($extra['price']);
            });
            // Reset array keys
            $extras = array_values($extras);
        }

        EateryMenu::create([
            'eatery_id' => $request->eatery_id,
            'menu_date' => $request->menu_date,
            'source_type' => $request->source_type,
            'source_file' => $filePath,
            'extracted_text' => $request->extracted_text,
            'structured_menu' => $request->structured_menu,
            'extras' => !empty($extras) ? $extras : null,
            'status' => 'active',
        ]);

        return redirect()->route('dashboard')->with('success', 'Daily menu uploaded successfully!');
    }

    private function extractTextFromSource(string $fullPath, string $type): string
    {
        if ($type === 'pdf') {
            return $this->extractTextFromPdf($fullPath);
        }
        return $this->extractTextFromImage($fullPath);
    }

    private function extractTextFromPdf(string $path): string
    {
        if (!file_exists($path)) {
            throw new \Exception("PDF file not found.");
        }

        $command = "pdftotext -layout -enc UTF-8 -nopgbrk '" . addslashes($path) . "' - 2>/dev/null";
        $output = shell_exec($command);

        if ($output === null || trim($output) === '') {
            return "PDF text extraction not configured. Install pdftotext for real extraction.";
        }

        return trim($output);
    }

    private function extractTextFromImage(string $path): string
    {
        $apiKey = env('GOOGLE_VISION_API_KEY');
        if (!$apiKey) {
            throw new \Exception("Google Vision API key not configured.");
        }

        $imageData = base64_encode(file_get_contents($path));
        $data = [
            'requests' => [
                [
                    'image' => ['content' => $imageData],
                    'features' => [['type' => 'TEXT_DETECTION']]
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://vision.googleapis.com/v1/images:annotate?key={$apiKey}");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception("Google Vision API error: " . substr($response, 0, 200));
        }

        $result = json_decode($response, true);
        $text = $result['responses'][0]['textAnnotations'][0]['description'] ?? '';

        return trim($text);
    }

    private function parseMenuText(string $text): array
    {
        Log::info('Starting menu parsing', ['text_length' => strlen($text)]);

        $sections = [];
        $currentSection = 'Menu';
        $lastItemIndex = null;

        // Split into lines and clean
        $lines = array_map('trim', explode("\n", $text));
        $lines = array_filter($lines);
        $lines = array_values($lines);

        $i = 0;
        $totalLines = count($lines);

        Log::info("Processing {$totalLines} lines");

        while ($i < $totalLines) {
            $line = $lines[$i];

            // Skip non-food related content
            if ($this->isNonFoodContent($line)) {
                $i++;
                continue;
            }

            // Auto-categorize salad items
            if ($this->isSaladItem($line)) {
                $currentSection = 'Salad';
                if (!isset($sections[$currentSection])) {
                    $sections[$currentSection] = [];
                }
            }

            // Detect section headers
            if ($this->isSectionHeader($line, $lines, $i)) {
                $currentSection = ucwords(strtolower(trim($line)));
                if (!isset($sections[$currentSection])) {
                    $sections[$currentSection] = [];
                }
                $lastItemIndex = null;
                Log::info("New section detected: {$currentSection}");
                $i++;
                continue;
            }

            // Check if current line is a standalone price
            if (preg_match('/^([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)$/u', $line)) {
                if (!empty($sections[$currentSection]) && $lastItemIndex !== null) {
                    $sections[$currentSection][$lastItemIndex]['price'] = trim($line);
                }
                $i++;
                continue;
            }

            // Check if this line is a description without price
            if ($lastItemIndex !== null && !preg_match('/[₦$€£¥]\d/', $line)) {
                $hasNextLinePrice = false;
                if ($i + 1 < $totalLines) {
                    $nextLine = trim($lines[$i + 1]);
                    if (preg_match('/^([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)$/u', $nextLine)) {
                        $hasNextLinePrice = true;
                    }
                }

                if (!$hasNextLinePrice && $this->looksLikeDescription($line)) {
                    $currentName = $sections[$currentSection][$lastItemIndex]['name'];
                    $sections[$currentSection][$lastItemIndex]['name'] = $currentName . ' - ' . $line;
                    $i++;
                    continue;
                }
            }

            $itemName = '';
            $price = '';

            // Pattern 1: Item with price on same line
            if (preg_match('/^(.+?)\s*[-–—]?\s*([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)$/u', $line, $matches)) {
                $itemName = trim($matches[1]);
                $price = trim($matches[2]);
            }
            // Pattern 2: Item with price in parentheses
            elseif (preg_match('/^(.+?)\s*\(([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)\)$/u', $line, $matches)) {
                $itemName = trim($matches[1]);
                $price = trim($matches[2]);
            }
            // Pattern 3: Item name, check next line for price
            else {
                $itemName = $line;

                if ($i + 1 < $totalLines) {
                    $nextLine = trim($lines[$i + 1]);

                    if (preg_match('/^([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)$/u', $nextLine)) {
                        $price = $nextLine;
                        $i++;
                    } elseif (preg_match('/^\$?(\d+(?:\.\d{2})?)$/u', $nextLine, $priceMatch)) {
                        $price = '$' . trim($priceMatch[1]);
                        $i++;
                    }
                }
            }

            // Clean up item name
            $itemName = trim(preg_replace('/\s*[-–—]\s*$/', '', $itemName));

            // Skip invalid items
            $lower = strtolower($itemName);
            if (
                strlen($itemName) < 3 ||
                str_contains($lower, 'powered by') ||
                str_contains($lower, 'signmenu') ||
                preg_match('/^[\d\s\-–—$₦€£¥.,:;]+$/', $itemName)
            ) {
                $i++;
                continue;
            }

            // Ensure section exists
            if (!isset($sections[$currentSection])) {
                $sections[$currentSection] = [];
            }

            // Add item WITHOUT image URL
            $sections[$currentSection][] = [
                'name' => $itemName,
                'price' => $price,
                // No image_url field anymore
            ];

            $lastItemIndex = count($sections[$currentSection]) - 1;

            $i++;
        }

        // Fallback if no sections
        if (empty($sections)) {
            $sections['Menu'] = [];
        }

        Log::info('Menu parsing complete', [
            'sections_count' => count($sections),
            'total_items' => array_sum(array_map('count', $sections))
        ]);

        return $sections;
    }

    // Helper methods (keep the same as before)
    private function isNonFoodContent(string $line): bool
    {
        $lower = strtolower($line);

        if (strlen($line) < 2) {
            return true;
        }

        $excludePatterns = [
            'powered by',
            'signmenu',
            'menu by',
            'copyright',
            '©',
            'all rights reserved',
            'www.',
            'http',
            '.com',
            '.net',
            '.org',
            'follow us',
            'like us',
            'visit us',
            'call us',
            'order online',
            'delivery available',
            'page ',
            'continued',
        ];

        foreach ($excludePatterns as $pattern) {
            if (str_contains($lower, $pattern)) {
                return true;
            }
        }

        if (preg_match('/^[\d\s\-–—_=*#$₦€£¥.,:;]+$/', $line)) {
            return true;
        }

        return false;
    }

    private function isSectionHeader(string $line, array $lines, int $currentIndex): bool
    {
        $categoryKeywords = [
            'breakfast',
            'lunch',
            'dinner',
            'brunch',
            'appetizers',
            'starters',
            'entrees',
            'mains',
            'main course',
            'desserts',
            'sweets',
            'pastries',
            'drinks',
            'beverages',
            'juice',
            'juices',
            'smoothies',
            'salad',
            'salads',
            'soup',
            'soups',
            'burger',
            'burgers',
            'sandwich',
            'sandwiches',
            'pizza',
            'pizzas',
            'pasta',
            'pastas',
            'seafood',
            'fish',
            'chicken',
            'beef',
            'pork',
            'lamb',
            'vegetarian',
            'vegan',
            'sides',
            'side dishes',
            'specials',
            'daily specials',
            "chef's specials",
            'combo',
            'combos',
            'meals',
            'kids menu',
            'children',
            'coffee',
            'tea',
            'hot drinks',
            'cold drinks',
            'soft drinks',
            'alcoholic',
            'wine',
            'beer',
            'cocktails'
        ];

        $lower = strtolower($line);

        $isKeywordMatch = false;
        foreach ($categoryKeywords as $keyword) {
            if ($lower === $keyword || preg_match('/^' . preg_quote($keyword, '/') . '\s*$/i', $lower)) {
                $isKeywordMatch = true;
                break;
            }
        }

        if ($isKeywordMatch) {
            if ($currentIndex + 1 < count($lines)) {
                $nextLine = trim($lines[$currentIndex + 1]);
                if (preg_match('/^([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)$/u', $nextLine)) {
                    return false;
                }
            }
            return true;
        }

        if (
            strlen($line) >= 2 &&
            strlen($line) <= 25 &&
            !preg_match('/[₦$€£¥]\s*\d/', $line) &&
            (ctype_upper(str_replace(' ', '', $line)) || ucwords($lower) === $line)
        ) {
            if ($currentIndex + 1 < count($lines)) {
                $nextLine = trim($lines[$currentIndex + 1]);
                if (preg_match('/^([₦$€£¥]\s*[\d,]+(?:\.\d{2})?)$/u', $nextLine)) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    private function looksLikeDescription(string $line): bool
    {
        $lower = strtolower($line);

        $descriptionPatterns = [
            'with',
            'and',
            'or',
            'served with',
            'includes',
            'topped with',
            'side of',
            'choice of',
            'comes with',
            'extra',
            'add',
            'grilled',
            'fried',
            'baked',
            'steamed'
        ];

        foreach ($descriptionPatterns as $pattern) {
            if (str_starts_with($lower, $pattern) || str_contains($lower, $pattern)) {
                return true;
            }
        }

        if (strlen($line) < 15 && !preg_match('/[₦$€£¥]/', $line)) {
            return true;
        }

        return false;
    }

    private function isSaladItem(string $line): bool
    {
        $lower = strtolower($line);
        $saladKeywords = ['salad', 'caesar', 'greek', 'garden', 'cobb', 'coleslaw'];

        foreach ($saladKeywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                return true;
            }
        }

        return false;
    }
}
