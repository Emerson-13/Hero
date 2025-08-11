import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import CalculatorButton from '@/Components/CalculatorButton';
import HeldTransactionsButton from '@/Components/HeldTransactionsButton';
import PosPinModal from '@/Modal/PosPinModal';

export default function POS() {
    const { auth, products, categories = [], selectedCategory = 'all', totals: initialTotals = null } = usePage().props;
    const user = auth?.user;
    const [cart, setCart] = useState([]);
    const [discountCode, setDiscountCode] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    
//dont change 
    const [totals, setTotals] = useState({
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        change: 0,
    });
//dont change 
    const { data, setData, reset } = useForm({
        customer_name: '',
        payment_method: 'cash',
        amount_paid: '',
    });
//dont change 
    useEffect(() => {
        const items = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        if (items.length === 0) {
            setTotals({
                subtotal: 0,
                discount: 0,
                tax: 0,
                total: 0,
                change: 0,
            });
            return;
        }

        axios.post(route('pos.calculate'), {
            items,
            discount_code: discountCode,
            amount_paid: parseFloat(data.amount_paid) || 0,
        })
        .then(res => {
            setTotals({
                subtotal: res.data.subtotal || 0,
                discount: res.data.discount || 0,
                tax: res.data.tax || 0,
                total: res.data.total || 0,
                change: res.data.change || 0,
            });

            // ✅ Safely update cart with returned item details
            if (Array.isArray(res.data.items)) {
                setCart(prevCart =>
                    prevCart.map(item => {
                        const matched = res.data.items.find(i => i.product_id === item.id);
                        if (!matched) return item;

                        const qty = item.quantity;
                        const price = Number(item.price);
                        const tax = matched.tax || 0;
                        const discount = matched.discount || 0;
                        const lineTotal = qty * price + tax - discount;

                        return {
                            ...item,
                            tax,
                            discount,
                            lineTotal,
                        };
                    })
                );
            }
        })
        .catch(() => {
            setTotals({
                subtotal: 0,
                discount: 0,
                tax: 0,
                total: 0,
                change: 0,
            });
        });
    }, [
        JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity }))),
        discountCode,
        data.amount_paid
    ]);

    useEffect(() => {
        const storedCart = localStorage.getItem('pos_cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pos_cart', JSON.stringify(cart));
    }, [cart]);

//dont change 
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
//dont change 
    const updateQuantity = (id, quantity) => {
        setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    };
//dont change 
    const changeCategory = (e) => {
        router.get(route('merchant.pos'), { category: e.target.value }, {
            preserveState: true,
            replace: true,
        });
    };
//dont change 
    const handleSubmit = () => {
        if (!cart.length) return alert('Cart is empty.');
       if ((data.amount_paid || 0) < (totals?.total || 0)) return alert('Amount paid is less than total.');

    if (data.payment_method === 'online') {
        alert('🚫 Online payment is currently not available. Please choose "Cash" instead.');
        return;
    }
        const items = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        router.post(route('pos.store'), {
            ...data,
            items,
            total: totals?.total || 0,
            discount_code: discountCode,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('✅ Sale completed!');
                setCart([]);
                reset();
                setDiscountCode('');
            },
        });
    };
    //for void button
      const handleVoidClick = () => {
        setShowPinModal(true);
    };
     //for void button
    const handlePinSubmit = async (pin) => {
        try {
            const response = await axios.post('/pos/unlock', {
                pospin: pin,
                user_id: user.id,
            });

            if (response.data.valid) {
                setCart([]);  
                setShowPinModal(false);
            } else {
                alert("❌ Invalid PIN.");
            }
        } catch (error) {
            console.error(error);
            alert("❌ Verification failed.");
        }
    };


    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold">POS</h2>}>
            <Head title="POS" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                       <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">🛒 Point of Sale Dashboard</h2>
                            <p className="text-center text-gray-600 mb-6">
                                Manage product sales, transactions, and discounts in one place.
                            </p>
                           <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mb-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* LEFT: Product List */}
                                    <div className="lg:col-span-2">
                                        <h3 className="text-lg font-bold mb-4">Product List</h3>

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

                                        <div className="mt-2 max-h-48 overflow-y-auto border rounded">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 bg-white">
                                                    <tr>
                                                        <th className="text-left px-2 py-1">Name</th>
                                                        <th className="text-left px-2 py-1">Qty</th>
                                                        <th className="text-left px-2 py-1">Price</th>
                                                    </tr>
                                                </thead>
                                            <tbody>
                                                    {cart.map(item => (
                                                        <tr key={item.id}>
                                                        <td className="px-2 py-1">{item.name}
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            <input
                                                            type="number"
                                                            value={item.quantity}
                                                            min="1"
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                            className="w-16 text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            <div>
                                                            {item.quantity} x ₱{Number(item.price).toFixed(2)}
                                                            </div>
                                                            {item.discount > 0 && (
                                                            <div className="text-green-600 text-xs">Disc: -₱{Number(item.discount).toFixed(2)}</div>
                                                            )}
                                                            {item.tax > 0 && (
                                                            <div className="text-blue-600 text-xs">Tax: +₱{Number(item.tax).toFixed(2)}</div>
                                                            )}
                                                            <div className="font-semibold">
                                                            Total: ₱{Number(item.lineTotal ?? item.quantity * item.price).toFixed(2)}
                                                            </div>
                                                        </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Discount Approval Section */}
                                        <div className="mt-4 space-y-2">
                                            <label className="block text-sm font-medium">Manager Approval Code</label>
                                            <input
                                                type="password"
                                                placeholder="Enter approval code"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                                className="border p-2 rounded block w-full"
                                            />
                                            <p className="text-xs text-gray-500">Required for Gov/Promo discount if enabled by Merchant.</p>
                                            {totals.discount > 0 && (
                                                <p className="text-green-600 text-sm">✅ Discount code applied: -₱{totals.discount.toFixed(2)}</p>
                                                )}
                                            {discountCode && totals.discount === 0 && (
                                                <p className="text-red-600 text-sm">❌ Invalid discount code or not allowed</p>
                                            )}
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
                                                <option value="online">Online</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Amount Paid"
                                                value={data.amount_paid}
                                                onChange={(e) => setData('amount_paid', parseFloat(e.target.value))}
                                                className="border p-2 rounded block w-full"
                                            />
                                        </div>

                                        {/* Computed Totals */}
                                        <div className="mt-4 text-sm text-right space-y-1 font-medium border-t pt-3">
                                        {cart.length > 0 ? (
                                            <div className="text-right space-y-1 mt-4 text-sm">
                                                <p>Subtotal: ₱{totals.subtotal.toFixed(2)}</p>
                                                <p>Discount: ₱{totals.discount.toFixed(2)}</p>
                                                <p>Tax: ₱{totals.tax.toFixed(2)}</p>
                                                <p className="font-semibold">Total: ₱{totals.total.toFixed(2)}</p>
                                                <p className="font-medium">Change: ₱{totals.change.toFixed(2)}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Cart is empty.</p>
                                        )}
                                    </div>
                                        <div >
                                    <PrimaryButton
                                        onClick={handleSubmit}
                                        className="px-4 py-2"
                                        disabled={!cart.length || (totals?.total > data.amount_paid)}
                                    >
                                        Complete Sale
                                    </PrimaryButton>
                                      <CalculatorButton className="px-4 py-2"/>
                                        <HeldTransactionsButton
                                        className="px-4 py-2"
                                            cart={cart}
                                            customerName={data.customer_name}
                                            paymentMethod={data.payment_method}
                                            amountPaid={data.amount_paid}
                                            onRecall={({ cart: recalledCart, customerName, paymentMethod, amountPaid }) => {
                                                setCart(recalledCart);
                                                setData({
                                                    customer_name: customerName,
                                                    payment_method: paymentMethod,
                                                    amount_paid: amountPaid
                                                });
                                            }}
                                        />
                                        <PrimaryButton
                                            onClick={() => handleVoidClick()}
                                            disabled={cart.length === 0}
                                            className="px-4 py-2 ml-2 text-red-500 text-xs hover:underline"
                                            title="Remove from cart"
                                         >
                                            🗑 Voi
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
               <PosPinModal
                            show={showPinModal}
                            onClose={() => setShowPinModal(false)}
                            onSubmit={handlePinSubmit}
                        />
        </AuthenticatedLayout>
    );
}
