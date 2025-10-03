import { useEffect, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import CalculatorButton from '@/Components/CalculatorButton';
import HeldTransactionsButton from '@/Components/HeldTransactionsButton';
import PosPinModal from '@/Modal/PosPinModal';
import axios from 'axios';

export default function POS() {
    const {
        auth,
        items: rawItems = {}, 
        categories = [],
        selectedCategory = 'all',
    } = usePage().props;

    const items = rawItems.data || [];
    const user = auth.user;

    const [cart, setCart] = useState([]);
    const [discountCode, setDiscountCode] = useState('');
    const [totals, setTotals] = useState({
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        change: 0,
    });
    const [showPinModal, setShowPinModal] = useState(false);
    const [search, setSearch] = useState('');

    const { data, setData, reset } = useForm({
        payment_method: 'cash',
        reference_number: '',
        amount_paid: '',
    });

    // load cart from localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('retail_cart');
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem('retail_cart', JSON.stringify(cart));
    }, [cart]);

    // 🔄 Auto calculate totals
    useEffect(() => {
        const itemsPayload = cart.map(item => ({
            item_id: item.id, // ✅ match backend
            quantity: item.quantity,
        }));

        if (itemsPayload.length === 0) {
            setTotals({ subtotal: 0, discount: 0, tax: 0, total: 0, change: 0 });
            return;
        }

        axios.post(route('pos.calculate'), {
            items: itemsPayload,
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

            if (Array.isArray(res.data.items)) {
                setCart(prevCart =>
                    prevCart.map(item => {
                        const matched = res.data.items.find(i => i.item_id === item.id);
                        if (!matched) return item;

                        const qty = item.quantity;
                        const price = Number(item.price);
                        const tax = matched.tax || 0;
                        const discount = matched.discount || 0;
                        const lineTotal = qty * price + tax - discount;

                        return { ...item, tax, discount, lineTotal };
                    })
                );
            }
        })
        .catch(() => {
            setTotals({ subtotal: 0, discount: 0, tax: 0, total: 0, change: 0 });
        });
    }, [
        JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity }))),
        discountCode,
        data.amount_paid
    ]);

    // ➕ Add this inside POS component, above return
    const changeCategory = (e) => {
        const newCategory = e.target.value;
        router.get(route('retail.pos'), {
            category: newCategory,
            search: search, // preserve search
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // ➕ Add item to cart
    const addToCart = (item) => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            if (existing.quantity < item.stock) {
                setCart(cart.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ));
            } else {
                alert('Stock limit reached.');
            }
        } else {
            if (item.stock > 0) setCart([...cart, { ...item, quantity: 1 }]);
            else alert('Out of stock!');
        }
    };

    // ✏️ Update qty
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        const inCart = cart.find(i => i.id === id);
        if (!inCart) return;
        if (quantity <= inCart.stock) {
            setCart(cart.map(i => (i.id === id ? { ...i, quantity } : i)));
        }
    };

    // 🔓 Void with PIN
    const handlePinSubmit = async (pin) => {
        try {
            const res = await axios.post('/pos/unlock', { pospin: pin, user_id: user.id });
            if (res.data.valid) {
                setCart([]);
                setShowPinModal(false);
            } else alert("❌ Invalid PIN.");
        } catch {
            alert("❌ Verification failed.");
        }
    };

    const handleSubmit = () => {
        if (!cart.length) return alert('Cart is empty.');
        if ((data.amount_paid || 0) < (totals?.total || 0)) return alert('Amount paid is less than total.');

        if (data.payment_method === 'online') {
            alert('🚫 Online payment not available. Use "Cash".');
            return;
        }

        const itemsPayload = cart.map(i => ({
            item_id: i.id,
            quantity: i.quantity,
        }));

        router.post(route('pos.store'), {
            ...data,
            items: itemsPayload,
            total: totals?.total || 0,
            discount_code: discountCode,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('✅ Order completed!');
                setCart([]);
                localStorage.removeItem('retail_cart');
                reset();
                setDiscountCode('');
            },
        });
    };
    const handleVoidClick = () => {
    setShowPinModal(true); // para lumabas yung PIN modal
};

    return(
         <div className="min-h-screen bg-gray-100 p-6">
            <Head title="POS" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🛒 POS Dashboard</h2>
                <PrimaryButton
                    onClick={() => {
                        window.history.back();
                        setTimeout(() => {
                        window.location.reload();
                        }, 100); // small delay so it reloads after going back
                    }}
                    >
                    Exit POS
                    </PrimaryButton>
                </div>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">🛒 Point of Sale Dashboard</h2>
                                <p className="text-center text-gray-600 mb-6">
                                    Manage item, sales, transactions, and discounts in one place.
                                </p>
                          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mb-6">
                            <div className="lg:flex gap-6">
                                {/* LEFT: item List */}
                                <div className="lg:w-2/3">
                                <h3 className="text-lg font-bold mb-4">Item List</h3>

                                <div className="mb-4 flex items-center gap-4">
                                    <label className="font-medium">Filter by Category:</label>
                                    <select
                                    className="border p-2 rounded"
                                    value={selectedCategory}
                                    onChange={changeCategory}
                                    >
                                    <option value="all">All</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="item name, barcode, description, etc."
                                        value={search}
                                        onChange={(e) => {
                                            const newSearch = e.target.value;
                                            setSearch(newSearch);
                                            router.get(route('retail.pos'), {
                                            search: newSearch,
                                            category: selectedCategory, // preserve category
                                            }, {
                                            preserveState: true,
                                            replace: true,
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                            const scannedCode = e.target.value.trim();
                                            if (scannedCode) {
                                                // Try to find item by barcode (exact match)
                                                const matchedItem = items.find(p => p.barcode === scannedCode);
                                                if (matchedItem) {
                                                addToCart(matchedItem);
                                                setSearch(''); // Clear search input after adding product
                                                e.preventDefault(); // Prevent form submission or other default behavior
                                                } else {
                                                // If not a barcode match, do normal search submit or alert
                                                // Optionally, you can alert or ignore here
                                                // alert(`No product found for barcode: ${scannedCode}`);
                                                }
                                            }
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />


                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {items.map((item) => (
                                    <div key={item.id} className="p-4 border rounded shadow-sm">
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p>{item.description}</p>
                                        <p>{item.stock}</p>
                                        <p className="text-green-600">₱{item.price}</p>
                                        <PrimaryButton onClick={() => addToCart(item)} className="mt-2">Add</PrimaryButton>
                                    </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <Pagination
                                    links={rawItems.links}
                                    preserveScroll
                                    preserveState
                                    data={{
                                        category: selectedCategory,
                                        search: search,
                                    }}
                                    />
                                </div>
                                </div>
                                {/* RIGHT: Cart */}
                                <div className="lg:w-1/3 mt-6 lg:mt-0 flex flex-col">
                                <h3 className="text-lg font-bold mb-4">Cart</h3>

                                <div className="overflow-y-auto max-h-80 border rounded">
                                    <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr>
                                        <th className="text-left px-2 py-1">Name</th>
                                        <th className="text-left px-2 py-1">Qty</th>
                                        <th className="text-left px-2 py-1">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item) => (
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
                                            <td className="px-2 py-1">
                                            <div>{item.quantity} x ₱{Number(item.price).toFixed(2)}</div>
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

                                {/* Right Column Content */}
                                <div className="mt-4 space-y-4">
                                    {/* Discount */}
                                    <div>
                                    <label className="block text-sm font-medium">Manager Approval Code</label>
                                    <input
                                        type="password"
                                        placeholder="Enter approval code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                            const scannedDiscount = e.target.value.trim();
                                            if (scannedDiscount) {
                                                const matchedDiscount = items.find(p => p.discount === scannedDiscount);
                                                if (matchedDiscount) {
                                                
                                                setSearch(''); // Clear search input after adding item
                                                e.preventDefault(); // Prevent form submission or other default behavior
                                                } else {
                                                // If not a barcode match, do normal search submit or alert
                                                // Optionally, you can alert or ignore here
                                                // alert(`No item found for barcode: ${scannedCode}`);
                                                }
                                            }
                                            }
                                        }}
                                        className="border p-2 rounded block w-full"
                                    />
                                    {totals.discount > 0 && (
                                        <p className="text-green-600 text-sm mt-1">✅ Code applied: -₱{totals.discount.toFixed(2)}</p>
                                    )}
                                    {discountCode && totals.discount === 0 && (
                                        <p className="text-red-600 text-sm mt-1">❌ Invalid discount code</p>
                                    )}
                                    </div>

                                    {/* Customer Info */}
                                    <div className="space-y-2">
                                   <select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="border p-2 rounded block w-full"
                                        >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online</option>
                                        <option value="credit">Credit Card</option>
                                        <option value="debit">Debit Card</option>
                                        </select>

                                        {/* Always include reference_number in state, but only show input if needed */}
                                        {['online', 'credit', 'debit'].includes(data.payment_method) && (
                                        <input
                                            type="text"
                                            placeholder="Reference Number"
                                            value={data.reference_number || ''}  // prevent undefined
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            className="border p-2 rounded block w-full"
                                            required
                                        />
                                        )}


                                    <input
                                        type="number"
                                        placeholder="Amount Paid"
                                        value={data.amount_paid || ''}
                                        onChange={(e) => setData('amount_paid', e.target.value)}
                                        className="border p-2 rounded block w-full"
                                    />
                                    </div>

                                    {/* Totals */}
                                    <div className="text-right border-t pt-3 text-sm space-y-1 font-medium">
                                    {cart.length > 0 ? (
                                        <>
                                        <p>Subtotal: ₱{totals.subtotal.toFixed(2)}</p>
                                        <p>Discount: ₱{totals.discount.toFixed(2)}</p>
                                        <p>Tax: ₱{totals.tax.toFixed(2)}</p>
                                        <p className="font-semibold">Total: ₱{totals.total.toFixed(2)}</p>
                                        <p className="font-medium">Change: ₱{totals.change.toFixed(2)}</p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">Cart is empty.</p>
                                    )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                    <PrimaryButton
                                        onClick={handleSubmit}
                                        className="px-4 py-2"
                                        disabled={!cart.length || (totals?.total > data.amount_paid)}
                                    >
                                        Complete Sale
                                    </PrimaryButton>
                                    <CalculatorButton className="px-4 py-2" />
                                    <HeldTransactionsButton
                                        className="px-4 py-2"
                                        cart={cart}
                                        paymentMethod={data.payment_method}
                                        amountPaid={data.amount_paid}
                                        onRecall={({ cart: recalledCart, paymentMethod, amountPaid }) => {
                                        setCart(recalledCart);
                                        setData({
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
                                                🗑 Void
                                            </PrimaryButton>
                                    </div>
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
        </div>
    );
}
