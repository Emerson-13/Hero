<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    public function index(Request $request) {
        $userId = auth()->id();

        $query = Item::where('user_id', $userId)
        ->with('category');

        // Filter by search keyword
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%")
                  ->orWhere('price', 'like', "%$search%");
            })
            ->orWhereHas('category', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        $items = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::where('user_id', $userId)->get();

        return Inertia::render('User/Item', [
            'items' => $items,
            'categories' => $categories,
            'search' => $request->search ?? '',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'barcode'     => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'tax_type'    => 'required|in:vatable,vat_exempt,zero_rated'
        ]);

        $userId = Auth::id();

        Item::create([
            'name'        => $validated['name'],
            'description' => $validated['description'],
            'price'       => $validated['price'],
            'stock'       => $validated['stock'],
            'barcode'     => $validated['barcode'],
            'category_id' => $validated['category_id'],
            'user_id'     => $userId,
            'tax_type'    => $validated['tax_type']
        ]);

        return redirect()->route('user.items')->with('success', 'Item added!');
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'barcode'     => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'tax_type'    => 'required|in:vatable,vat_exempt,zero_rated'
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return redirect()->back()->with('success', 'Item deleted successfully.');
    }

    public function exportItemsCsv(Request $request)
    {
        $categoryIds = $request->input('category_id'); // Expecting array of IDs

        if (!is_array($categoryIds) && $categoryIds !== null) {
            $categoryIds = [$categoryIds];
        }

        $items = Item::with('category')
            ->when(!empty($categoryIds), function ($query) use ($categoryIds) {
                $query->whereIn('category_id', $categoryIds);
            })
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Headers
        $sheet->fromArray([
            ['Name', 'Barcode', 'Description', 'Category', 'Price', 'Stock']
        ]);

        $rowIndex = 2;
        foreach ($items as $item) {
            $sheet->fromArray([[
                $item->name,
                $item->barcode,
                $item->description,
                $item->category->name ?? 'Uncategorized',
                $item->price,
                $item->stock,
            ]], null, 'A' . $rowIndex++);
        }

        $filename = 'items_' . now()->format('Ymd_His') . '.xlsx';

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        $userId = auth()->id();

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();

            $highestRow = $sheet->getHighestDataRow();
            if ($highestRow < 2) {
                return back()->with([
                    'error' => 'The file has no data rows.',
                    'upload_errors' => ['The file has no data rows.'],
                ]);
            }

            $expected = ['name','barcode','description','category','stock','price'];
            $headerRow = $sheet->rangeToArray('A1:F1', null, true, true, true)[1];

            $normalize = fn($v) => mb_strtolower(preg_replace('/\s+/', ' ', trim((string)($v ?? ''))));

            $gotNorm = [
                $normalize($headerRow['A'] ?? ''),
                $normalize($headerRow['B'] ?? ''),
                $normalize($headerRow['C'] ?? ''),
                $normalize($headerRow['D'] ?? ''),
                $normalize($headerRow['E'] ?? ''),
                $normalize($headerRow['F'] ?? ''),
            ];

            if ($gotNorm !== $expected) {
                $found = [
                    (string)($headerRow['A'] ?? ''),
                    (string)($headerRow['B'] ?? ''),
                    (string)($headerRow['C'] ?? ''),
                    (string)($headerRow['D'] ?? ''),
                    (string)($headerRow['E'] ?? ''),
                    (string)($headerRow['F'] ?? ''),
                ];
                $msg = 'Invalid header. Expected exactly: Name, Barcode, Description, Category, Stock, Price. '
                     . 'Found: ' . implode(', ', $found);
                return back()->with([
                    'error' => $msg,
                    'upload_errors' => [$msg],
                ]);
            }

            $errors = [];
            $rowsData = [];
            $seenBarcodes = [];

            for ($r = 2; $r <= $highestRow; $r++) {
                $row = $sheet->rangeToArray("A{$r}:F{$r}", null, true, true, true)[$r];
                $all = array_map('trim', [(string)$row['A'], (string)$row['B'], (string)$row['C'], (string)$row['D'], (string)$row['E'], (string)$row['F']]);
                if (implode('', $all) === '') continue;

                $name        = trim($row['A']);
                $barcodeRaw  = (string)$row['B'];
                $barcode     = trim(preg_replace('/\.0$/', '', $barcodeRaw));
                $description = trim($row['C']);
                $categoryVal = trim($row['D']);
                $stockVal    = $row['E'];
                $priceVal    = $row['F'];

                if ($name === '' || $barcode === '') {
                    $errors[] = "Row {$r}: Name and Barcode are required.";
                    continue;
                }
                if (!is_numeric($stockVal) || (int)$stockVal < 0) {
                    $errors[] = "Row {$r}: Stock must be a non-negative integer.";
                    continue;
                }
                if (!is_numeric($priceVal) || (float)$priceVal < 0) {
                    $errors[] = "Row {$r}: Price must be a non-negative number.";
                    continue;
                }

                $dupKey = mb_strtolower($barcode);
                if (isset($seenBarcodes[$dupKey])) {
                    $errors[] = "Row {$r}: Duplicate barcode '{$barcode}' appears multiple times.";
                    continue;
                }
                $seenBarcodes[$dupKey] = true;

                $categoryId = null;
                $categoryName = null;

                if ($categoryVal !== '') {
                    if (ctype_digit($categoryVal)) {
                        $cat = Category::where('id', (int)$categoryVal)
                            ->where('user_id', $userId)
                            ->first();
                        if ($cat) {
                            $categoryId = $cat->id;
                        } else {
                            $errors[] = "Row {$r}: Category ID '{$categoryVal}' does not exist for this user.";
                            continue;
                        }
                    } else {
                        $categoryName = $categoryVal;
                    }
                }

                $rowsData[] = [
                    'row'           => $r,
                    'name'          => $name,
                    'barcode'       => $barcode,
                    'description'   => $description,
                    'category_id'   => $categoryId,
                    'category_name' => $categoryName,
                    'stock'         => (int)$stockVal,
                    'price'         => (float)$priceVal,
                ];
            }

            if ($errors) {
                return back()->with([
                    'error' => 'Import canceled due to errors.',
                    'upload_errors' => $errors,
                ]);
            }

            DB::transaction(function () use ($rowsData, $userId) {
                $nameToId = [];
                foreach ($rowsData as $d) {
                    if ($d['category_id'] === null && $d['category_name']) {
                        $norm = mb_strtolower($d['category_name']);
                        if (!isset($nameToId[$norm])) {
                            $cat = Category::firstOrCreate(
                                ['user_id' => $userId, 'name' => $d['category_name']]
                            );
                            $nameToId[$norm] = $cat->id;
                        }
                    }
                }

                foreach ($rowsData as $d) {
                    $categoryId = $d['category_id'];
                    if (!$categoryId && $d['category_name']) {
                        $categoryId = $nameToId[mb_strtolower($d['category_name'])] ?? null;
                    }

                    Item::updateOrCreate(
                        [
                            'user_id' => $userId,
                            'barcode' => $d['barcode'],
                        ],
                        [
                            'name'        => $d['name'],
                            'description' => $d['description'] ?? '',
                            'category_id' => $categoryId,
                            'stock'       => $d['stock'],
                            'price'       => $d['price'],
                        ]
                    );
                }
            });

            return back()->with('success', 'Items imported successfully.');
        } catch (\Throwable $e) {
            return back()->with([
                'error' => 'Failed to process file.',
                'upload_errors' => [$e->getMessage()],
            ]);
        }
    }
}
