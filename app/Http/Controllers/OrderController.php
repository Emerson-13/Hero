<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * List of Orders (with minimal columns for table view)
    */
    public function index(Request $request)
    {
        $userId = auth()->id();

        $query = Order::withCount(['items', 'menus'])
            ->where('user_id', $userId);

        if ($request->filled('search')) {
            $search = $request->search;

            // Search in both items and menus
            $query->where(function ($q) use ($search) {
                $q->whereHas('items.item', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%");
                })->orWhereHas('menus.menu', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%");
                });
            });
        }

        $orders = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Orders', [
            'orders' => $orders,
            'search' => $request->search ?? '',
        ]);
    }

    /**
     * Show only the Order Items for a given order
     */
    public function showDetails(Order $order)
    {
        $order->load(['items.item', 'menus.menu.ingredients']); 

        return response()->json([
            'order_id' => $order->id,
            'items' => $order->items,
            'menus' => $order->menus,
        ]);
    }
    /**
     * Update Order status or payment_status
     */
    public function update(Request $request, Order $order)
    {

        $request->validate([
            'status' => 'nullable|in:pending,cancelled,completed',
            'payment_status' => 'nullable|in:unpaid,paid,refunded',
        ]);

        $order->update($request->only('status', 'payment_status'));

        return redirect()->back()->with('success', 'Order updated successfully!');
    }
    /**
     * Delete an Order and its items
     */

    /**
     * Export orders as CSV
     */
    public function exportCsv(Request $request)
    {
        $userId = auth()->id();
        $query = Order::with(['items.item', 'menus.menu'])
            ->where('user_id', $userId);

        // Filter by date range if provided
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $orders = $query->orderBy('id', 'desc')->get();

        $filename = 'orders_report_' . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $columns = [
            'Order ID', 'Customer Name', 'Amount Paid', 'Subtotal', 'Total Discount', 'Total Tax', 'Total Price', 'Change', 'Status', 'Payment Status',
            'Item Barcodes', 'Item Names', 'Menu Barcodes', 'Menu Names', 'Created At'
        ];

        $callback = function () use ($orders, $columns, $request) {
            $file = fopen('php://output', 'w');

            // Title row
            fputcsv($file, ['=== HERO STORE ORDERS REPORT ===']);
            // Date range info
            $dateRange = [];
            if ($request->filled('from')) $dateRange[] = 'From: ' . $request->from;
            if ($request->filled('to')) $dateRange[] = 'To: ' . $request->to;
            fputcsv($file, [$dateRange ? implode(' ', $dateRange) : 'All Dates']);
            // Blank row
            fputcsv($file, []);
            // Column headers
            fputcsv($file, $columns);

            foreach ($orders as $order) {
                $itemBarcodes = $order->items->map(fn($oi) => $oi->item->barcode ?? '')->filter()->implode(', ');
                $itemNames = $order->items->map(fn($oi) => $oi->item->name ?? '')->filter()->implode(', ');
                $menuBarcodes = $order->menus->map(fn($om) => $om->menu->barcode ?? '')->filter()->implode(', ');
                $menuNames = $order->menus->map(fn($om) => $om->menu->name ?? '')->filter()->implode(', ');

                fputcsv($file, [
                    $order->id,
                    $order->customer_name,
                    number_format($order->amount_paid, 2),
                    number_format($order->subtotal, 2),
                    number_format($order->total_discount, 2),
                    number_format($order->total_tax, 2),
                    number_format($order->total_price, 2),
                    number_format($order->change, 2),
                    ucfirst($order->status),
                    ucfirst($order->payment_status),
                    $itemBarcodes,
                    $itemNames,
                    $menuBarcodes,
                    $menuNames,
                    date('Y-m-d H:i:s', strtotime($order->created_at)),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
