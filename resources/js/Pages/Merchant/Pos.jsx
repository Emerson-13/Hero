import { useEffect, useState, useMemo} from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import CalculatorButton from '@/Components/CalculatorButton';
import HeldTransactionsButton from '@/Components/HeldTransactionsButton';
import PosPinModal from '@/Modal/PosPinModal';

export default function POS() {
    const {auth, products: rawProducts = {}, categories = [], selectedCategory = 'all', totals: initialTotals = null } = usePage().props;
    const products = rawProducts.data || [];
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
    const { data, setData, reset, post } = useForm({
        customer_name: '',
        payment_method: 'cash',
        amount_paid: '',
    });

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

    const handleVoidClick = () => {
        setShowPinModal(true);
    };

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
                localStorage.removeItem('pos_cart');
                reset();
                setDiscountCode('');
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <Head title="POS" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🛒 POS Dashboard</h2>
                <PrimaryButton onClick={() => window.history.back()}>Exit POS</PrimaryButton>
                </div>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">🛒 Point of Sale Dashboard</h2>
                                <p className="text-center text-gray-600 mb-6">
                                    Manage product sales, transactions, and discounts in one place.
                                </p>
                          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mb-6">
                            <div className="lg:flex gap-6">
                                {/* LEFT: Product List */}
                                <div className="lg:w-2/3">
                                <h3 className="text-lg font-bold mb-4">Product List</h3>

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
                                        placeholder="Product name, barcode, description, etc."
                                        value={search}
                                        onChange={(e) => {
                                            const newSearch = e.target.value;
                                            setSearch(newSearch);
                                            router.get(route('merchant.pos'), {
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
                                                // Try to find product by barcode (exact match)
                                                const matchedProduct = products.find(p => p.barcode === scannedCode);
                                                if (matchedProduct) {
                                                addToCart(matchedProduct);
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
                                    {products.map((product) => (
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
                                    links={rawProducts.links}
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
                                        value={data.amount_paid || ''}
                                        onChange={(e) => setData('amount_paid', parseFloat(e.target.value || 0))}
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
