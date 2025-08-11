import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default function MerchantDashboard() {
  const {
    salesPerHour = {},
    salesPerDay = {},
    salesPerWeek = {},
    totalDiscount = 0,
    totalTax = 0,
    totalProducts = 0,
    lowStockProducts = 0,
    lowStockProductDetails = [],
    categoryProductCounts = [],
    totalCategories = 0,
    totalStaff = 0,
  } = usePage().props;

  const [salesPeriod, setSalesPeriod] = useState('day'); // default: day

  // Sales line chart data & labels
  const salesLineData = useMemo(() => {
    let labels = [];
    let data = [];

    if (salesPeriod === 'day') {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      data = labels.map((_, i) => salesPerHour[i] || 0);
    } else if (salesPeriod === 'week') {
      labels = Object.keys(salesPerDay).sort();
      data = labels.map(date => salesPerDay[date] || 0);
      labels = labels.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, { weekday: 'short' });
      });
    } else if (salesPeriod === 'month') {
      labels = Object.keys(salesPerWeek).sort();
      data = labels.map(week => salesPerWeek[week] || 0);
      labels = labels.map(week => `Week ${week}`);
    }

    return {
      labels,
      datasets: [
        {
          label: `Sales by ${salesPeriod}`,
          data,
          fill: false,
          borderColor: 'rgba(54, 162, 235, 0.7)',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          tension: 0.3,
          pointRadius: 5,
        },
      ],
    };
  }, [salesPeriod, salesPerHour, salesPerDay, salesPerWeek]);

  // Category pie chart data
  const categoryLabels = categoryProductCounts.map(c => c.category_name);
  const categoryDataValues = categoryProductCounts.map(c => c.product_count);
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Products per Category',
        data: categoryDataValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
        hoverOffset: 30,
      },
    ],
  };

  // Discount vs Tax doughnut data
  const discountTaxData = {
    labels: ['Total Discount', 'Total Tax'],
    datasets: [
      {
        label: '₱',
        data: [totalDiscount, totalTax],
        backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'],
        hoverOffset: 30,
      },
    ],
  };

  // Product stock bar chart data
  const productData = {
    labels: ['Total Products', 'Low Stock Products'],
    datasets: [
      {
        label: 'Count',
        data: [totalProducts, lowStockProducts],
        backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)'],
      },
    ],
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}
    >
      <Head title="Merchant Dashboard" />

      <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Merchant Dashboard</h1>

        {/* Sales Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sales Overview</h2>
            <select
              className="border rounded p-2"
              value={salesPeriod}
              onChange={e => setSalesPeriod(e.target.value)}
            >
              <option value="day">By Hour (Today)</option>
              <option value="week">By Day (This Week)</option>
              <option value="month">By Week (This Month)</option>
            </select>
          </div>

          <Line
            data={salesLineData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: {
                  display: true,
                  text: `Sales Overview (${salesPeriod.charAt(0).toUpperCase() + salesPeriod.slice(1)}) (₱)`,
                  font: { size: 18 },
                },
              },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </section>

        {/* Discount vs Tax */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Discount vs Tax</h2>
            <Doughnut
              data={discountTaxData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Total Discount and Tax (₱)',
                    font: { size: 18 },
                  },
                },
              }}
            />
          </div>

          {/* Product Stock */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Stock Status</h2>
            <Bar
              data={productData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Total Products and Low Stock Products',
                    font: { size: 18 },
                  },
                },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </section>

        {/* Product Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Product Categories</h2>
          <Pie
            data={categoryData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' },
                title: {
                  display: true,
                  text: 'Products per Category',
                  font: { size: 18 },
                },
              },
            }}
          />
        </section>

        {/* Low Stock Products Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
          {lowStockProductDetails.length === 0 ? (
            <p>All products are sufficiently stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-2 border-b border-gray-300">Product Name</th>
                    <th className="text-right px-4 py-2 border-b border-gray-300">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProductDetails.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b border-gray-300">{product.name}</td>
                      <td className="px-4 py-2 border-b border-gray-300 text-right">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-8">
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <h3 className="font-semibold text-lg">Total Categories</h3>
            <p className="text-2xl font-bold">{totalCategories}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <h3 className="font-semibold text-lg">Total Staff</h3>
            <p className="text-2xl font-bold">{totalStaff}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <h3 className="font-semibold text-lg">Low Stock Products</h3>
            <p className="text-2xl font-bold">{lowStockProducts}</p>
          </div>
          {/* Add more summary cards if you want */}
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
