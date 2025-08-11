<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MerchantDashboardController extends Controller
{
    public function index()
    {
        $merchantId = auth()->id();

        $now = Carbon::now();

        // Sales per hour for today
        $salesPerHour = Transaction::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('SUM(total) as total_sales')
            )
            ->where('merchant_id', $merchantId)
            ->whereDate('created_at', $now->toDateString())
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->keyBy('hour');

        // Sales per day for this week (Mon-Sun)
        $startOfWeek = $now->copy()->startOfWeek();
        $salesPerDay = Transaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total_sales')
            )
            ->where('merchant_id', $merchantId)
            ->whereBetween('created_at', [$startOfWeek, $now])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Sales per week for this month
        $startOfMonth = $now->copy()->startOfMonth();
        $salesPerWeek = Transaction::select(
                DB::raw('WEEK(created_at, 1) as week_number'),
                DB::raw('SUM(total) as total_sales')
            )
            ->where('merchant_id', $merchantId)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->groupBy('week_number')
            ->orderBy('week_number')
            ->get()
            ->keyBy('week_number');

        // Prepare full arrays with zero for missing keys

        $salesPerHourArr = [];
        for ($h = 0; $h <= 23; $h++) {
            $salesPerHourArr[$h] = $salesPerHour->has($h) ? (float) $salesPerHour[$h]->total_sales : 0;
        }

        $salesPerDayArr = [];
        for ($d = 0; $d < 7; $d++) {
            $date = $startOfWeek->copy()->addDays($d)->toDateString();
            $salesPerDayArr[$date] = $salesPerDay->has($date) ? (float) $salesPerDay[$date]->total_sales : 0;
        }

        $currentWeekNumber = $now->weekOfYear;
        $startMonthWeekNumber = $startOfMonth->weekOfYear;

        $salesPerWeekArr = [];
        for ($weekNum = $startMonthWeekNumber; $weekNum <= $currentWeekNumber; $weekNum++) {
            $salesPerWeekArr[$weekNum] = $salesPerWeek->has($weekNum) ? (float) $salesPerWeek[$weekNum]->total_sales : 0;
        }

        // Total discount and tax from sales related to merchant
        $totalDiscount = Sale::whereHas('transaction', function ($query) use ($merchantId) {
            $query->where('merchant_id', $merchantId);
        })->sum('discount');

        $totalTax = Sale::whereHas('transaction', function ($query) use ($merchantId) {
            $query->where('merchant_id', $merchantId);
        })->sum('tax');

        // Total products, categories, staff
        $totalProducts = Product::where('merchant_id', $merchantId)->count();
        $totalCategories = Category::where('merchant_id', $merchantId)->count();
        $totalStaff = User::where('merchant_id', $merchantId)->count();

        // Low stock products & details (stock <= 5)
        $lowStockProductsCount = Product::where('merchant_id', $merchantId)
            ->where('stock', '<=', 5)
            ->count();

        $lowStockProductDetails = Product::where('merchant_id', $merchantId)
            ->where('stock', '<=', 5)
            ->select('id', 'name', 'stock')
            ->get();

        // Category product counts for pie chart
        $categoryProductCounts = Product::select('category_id', DB::raw('count(*) as product_count'))
            ->where('merchant_id', $merchantId)
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category_name' => $item->category->name ?? 'Unknown',
                    'product_count' => $item->product_count,
                ];
            });

        return Inertia::render('Merchant/Dashboard', [
            'salesPerHour' => $salesPerHourArr,
            'salesPerDay' => $salesPerDayArr,
            'salesPerWeek' => $salesPerWeekArr,
            'totalDiscount' => (float) $totalDiscount,
            'totalTax' => (float) $totalTax,
            'totalProducts' => $totalProducts,
            'totalCategories' => $totalCategories,
            'totalStaff' => $totalStaff,
            'lowStockProducts' => $lowStockProductsCount,
            'lowStockProductDetails' => $lowStockProductDetails,
            'categoryProductCounts' => $categoryProductCounts,
        ]);
    }
}
