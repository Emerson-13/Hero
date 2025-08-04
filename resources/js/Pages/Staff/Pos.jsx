import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function POS() {
    const { products, categories = [], selectedCategory = 'all' } = usePage().props;

    const [cart, setCart] = useState([]);

    const { data, setData, post, reset } = useForm({
        customer_name: '',
        payment_method: 'cash',
        amount_paid: '',
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const change = data.amount_paid - total;

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, quantity) => {
        setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const changeCategory = (e) => {
        router.get(route('merchant.pos'), { category: e.target.value }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSubmit = () => {
    if (!cart.length) return alert('Cart is empty.');
    if (data.amount_paid < total) return alert('Amount paid is less than total.');

    const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
    }));

    router.post(route('pos.store'), {
        ...data, // from useForm: customer_name, payment_method, amount_paid
        items,
        total,   // computed dynamically, passed manually
    }, {
        preserveScroll: true,
        onSuccess: () => {
            alert('Sale completed!');
            setCart([]);
            setData('amount_paid', ''); 
            reset(); // reset useForm state
        },
    });
};


 return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">POS</h2>}>
        <Head title="POS" />

        <div className="py-12">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT: Product List */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-bold mb-4">Product List</h3>

                            {/* Category Filter */}
                            <div className="mb-4 flex items-center gap-4">
                                <label className="font-medium">Filter by Category:</label>
                                <select
                                    className="border p-2 rounded"
                                    value={selectedCategory}
                                    onChange={changeCategory}
                                >
                                    <option value="all">All</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Product Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {products.data.map(product => (
                                    <div key={product.id} className="p-4 border rounded shadow-sm">
                                        <h4 className="font-bold">{product.name}</h4>
                                        <p>{product.description}</p>
                                        <p className="text-green-600">₱{product.price}</p>
                                        <PrimaryButton onClick={() => addToCart(product)} className="mt-2">Add</PrimaryButton>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                <Pagination
                                    links={products.links}
                                    preserveScroll
                                    preserveState
                                    data={{ category: selectedCategory }}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Cart & Checkout */}
                        <div className="lg:col-span-1 border-l border-gray-300 pl-6">
                            <h3 className="text-lg font-bold mb-4">Cart</h3>
                            {/* Cart Table */}
                            <div className="mt-2 max-h-48 overflow-y-auto border rounded">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-white">
                                        <tr>
                                            <th className="text-left px-2 py-1">Name</th>
                                            <th className="text-left px-2 py-1">Qty</th>
                                            <th className="text-left px-2 py-1">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-2 py-1">{item.name}</td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        min="1"
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        className="w-16 text-center"
                                                    />
                                                </td>
                                                <td className="px-2 py-1">₱{item.quantity * item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-2 text-right font-semibold">
                                <p>Total: ₱{total}</p>
                            </div>

                            {/* Customer Info */}
                            <div className="mt-4 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    className="border p-2 rounded block w-full"
                                />
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="border p-2 rounded block w-full"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="card">Card</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Amount Paid"
                                    value={data.amount_paid}
                                    onChange={(e) => setData('amount_paid', parseFloat(e.target.value))}
                                    className="border p-2 rounded block w-full"
                                />
                                <p className="font-medium">Change: ₱{change >= 0 ? change : 0}</p>
                            </div>

                            <PrimaryButton onClick={handleSubmit} className="mt-4 w-full">
                                Complete Sale
                            </PrimaryButton>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </AuthenticatedLayout>
);}
