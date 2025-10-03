// resources/js/Pages/User/POS.jsx
import { useEffect, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import CalculatorButton from '@/Components/CalculatorButton';
import HeldTransactionsButton from '@/Components/HeldTransactionsButton';
import PosPinModal from '@/Modal/PosPinModal';
import axios from 'axios';

export default function POSMenu() {
    const {
        auth,
        menus: rawMenus = {},
        categories = [],
        selectedCategory = 'all',
    } = usePage().props;

    const menus = rawMenus.data || [];
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

    // Load cart from localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('menu_cart');
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem('menu_cart', JSON.stringify(cart));
    }, [cart]);

    // 🔄 Auto calculate totals
    useEffect(() => {
        const menusPayload = cart.map(menu => ({
            menu_id: menu.id,
            quantity: menu.quantity,
        }));

        if (!menusPayload.length) {
            setTotals({ subtotal: 0, discount: 0, tax: 0, total: 0, change: 0 });
            setCart(prev => prev.map(m => ({
                ...m,
                tax: 0,
                discount: 0,
                lineTotal: m.quantity * m.price
            })));
            return;
        }

        axios.post(route('food.calculate'), {
            menus: menusPayload,
            discount_code: discountCode,
            amount_paid: parseFloat(data.amount_paid) || 0,
        })
        .then(res => {
            const responseTotals = res.data;

            // Fallbacks for backend field names
            setTotals({
                subtotal: responseTotals.subtotal ?? responseTotals.sub_total ?? 0,
                discount: responseTotals.total_discount ?? responseTotals.discount ?? 0,
                tax: responseTotals.total_tax ?? responseTotals.tax ?? 0,
                total: responseTotals.grand_total ?? responseTotals.total ?? 0,
                change: responseTotals.change ?? 0,
            });

            if (Array.isArray(responseTotals.detailed_menus ?? responseTotals.menus)) {
                const backendMenus = responseTotals.detailed_menus ?? responseTotals.menus;
                setCart(prevCart =>
                    prevCart.map(menu => {
                        const matched = backendMenus.find(i => i.menu_id === menu.id);
                        if (!matched) return menu;

                        return {
                            ...menu,
                            tax: matched.tax ?? 0,
                            discount: matched.discount ?? 0,
                            lineTotal: matched.total ?? (menu.quantity * menu.price + (matched.tax ?? 0) - (matched.discount ?? 0)),
                            computed_stock: menu.computed_stock
                        };
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

    // Change category
    const changeCategory = (e) => {
        const newCategory = e.target.value;
        router.get(route('food.pos'), {
            category: newCategory,
            search: search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Add to cart with stock check
    const addToCart = (menu) => {
        const existing = cart.find(i => i.id === menu.id);
        const availableStock = menu.computed_stock ?? 0;

        console.log("🍽️ Adding to cart:", menu.name);
        console.log("Available stock for this menu:", availableStock);
        console.log("Current cart quantity:", existing ? existing.quantity : 0);
        if (menu.ingredients) {
            console.log("Ingredients stock:");
            menu.ingredients.forEach(ing => {
                console.log(`- ${ing.name}: ${ing.stock ?? 0}`);
            });
        }

        if (existing) {
            if (existing.quantity < availableStock) {
                setCart(cart.map(i =>
                    i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i
                ));
            } else {
                alert('⚠️ Stock limit reached for this menu.');
            }
        } else {
            if (availableStock > 0) {
                setCart([...cart, {
                    ...menu,
                    quantity: 1,
                    tax: 0,
                    discount: 0,
                    lineTotal: menu.price
                }]);
            } else {
                alert('❌ This menu is out of stock (not enough ingredients).');
            }
        }
    };

    // Update quantity with stock check
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        const inCart = cart.find(i => i.id === id);
        if (!inCart) return;

        const availableStock = inCart.computed_stock ?? 0;
        if (quantity <= availableStock) {
            setCart(cart.map(i => (i.id === id ? { ...i, quantity } : i)));
        } else {
            alert('⚠️ Quantity exceeds available stock.');
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

    // Complete sale
    const handleSubmit = () => {
        if (!cart.length) return alert('Cart is empty.');
        if ((data.amount_paid || 0) < (totals?.total || 0)) return alert('Amount paid is less than total.');

        if (data.payment_method === 'online') {
            alert('🚫 Online payment not available. Use "Cash" for POS.');
            return;
        }

        const menusPayload = cart.map(i => ({
            menu_id: i.id,
            quantity: i.quantity,
        }));

        router.post(route('food.store'), {
            ...data,
            menus: menusPayload,
            total: totals?.total || 0,
            discount_code: discountCode,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('✅ Order completed!');
                setCart([]);
                localStorage.removeItem('menu_cart');
                reset();
                setDiscountCode('');
            },
            onError: (errs) => {
                console.error(errs);
                alert('❌ Failed to place order. Check console.');
            }
        });
    };

    const handleVoidClick = () => setShowPinModal(true);

    const handleSearchKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        const scannedCode = e.target.value.trim();
        if (!scannedCode) return;
        const matchedMenu = menus.find(m => m.barcode === scannedCode);
        if (matchedMenu) {
            addToCart(matchedMenu);
            setSearch('');
            e.preventDefault();
        }
    };

    const formatCurrency = (num) => Number(num || 0).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <Head title="POS" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🍽️ Food POS Dashboard</h2>
                <PrimaryButton
                    onClick={() => {
                        window.history.back();
                        setTimeout(() => window.location.reload(), 100);
                    }}
                >
                    Exit POS
                </PrimaryButton>
            </div>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">🍽️ Point of Sale</h2>
                        <p className="text-center text-gray-600 mb-6">
                            Order menus, manage sales, transactions, and discounts.
                        </p>

                        <div className="lg:flex gap-6">
                            {/* LEFT: Menu List */}
                            <div className="lg:w-2/3">
                                <h3 className="text-lg font-bold mb-4">Menu List</h3>

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
                                        placeholder="menu name, barcode, description, etc."
                                        value={search}
                                        onChange={(e) => {
                                            const newSearch = e.target.value;
                                            setSearch(newSearch);
                                            router.get(route('food.pos'), {
                                                search: newSearch,
                                                category: selectedCategory,
                                            }, { preserveState: true, replace: true });
                                        }}
                                        onKeyDown={handleSearchKeyDown}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {menus.map(menu => (
                                        <div key={menu.id} className="p-4 border rounded shadow-sm">
                                            <h4 className="font-bold">{menu.name}</h4>
                                            <p className="text-sm text-gray-600">{menu.description}</p>
                                            {menu.computed_stock > 0 ? (
                                                <p className="text-green-600 text-xs">✅ Available</p>
                                            ) : (
                                                <p className="text-red-600 text-xs">❌ Out of Stock</p>
                                            )}
                                            <p>
                                                <strong>Available Servings:</strong>{menu.computed_stock}
                                            </p>
                                            <p className="text-green-600 font-semibold">₱{formatCurrency(menu.price)}</p>
                                            <PrimaryButton
                                                onClick={() => addToCart(menu)}
                                                className="mt-2"
                                                disabled={menu.computed_stock <= 0}
                                            >
                                                {menu.computed_stock > 0 ? "Add" : "Unavailable"}
                                            </PrimaryButton>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <Pagination
                                        links={rawMenus.links}
                                        preserveScroll
                                        preserveState
                                        data={{ category: selectedCategory, search }}
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
                                            {cart.map(menu => (
                                                <tr key={menu.id}>
                                                    <td className="px-2 py-1">{menu.name}</td>
                                                    <td className="px-2 py-1">
                                                        <input
                                                            type="number"
                                                            value={menu.quantity}
                                                            min="1"
                                                            onChange={(e) => updateQuantity(menu.id, parseInt(e.target.value))}
                                                            className="w-16 text-center"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        <div>{menu.quantity} x ₱{formatCurrency(menu.price)}</div>
                                                        {menu.discount > 0 && <div className="text-green-600 text-xs">Disc: -₱{formatCurrency(menu.discount)}</div>}
                                                        {menu.tax > 0 && <div className="text-blue-600 text-xs">Tax: +₱{formatCurrency(menu.tax)}</div>}
                                                        <div className="font-semibold">Total: ₱{formatCurrency(menu.lineTotal ?? menu.quantity * menu.price)}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals + Buttons */}
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Manager Approval / Discount Code</label>
                                        <input
                                            type="password"
                                            placeholder="Enter approval or discount code"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="border p-2 rounded block w-full"
                                        />
                                        {totals.discount > 0 && (
                                            <p className="text-green-600 text-sm mt-1">✅ Code applied: -₱{formatCurrency(totals.discount)}</p>
                                        )}
                                        {discountCode && totals.discount === 0 && (
                                            <p className="text-red-600 text-sm mt-1">❌ Invalid discount code</p>
                                        )}
                                    </div>

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

                                        {['online', 'credit', 'debit'].includes(data.payment_method) && (
                                            <input
                                                type="text"
                                                placeholder="Reference Number"
                                                value={data.reference_number || ''}
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

                                    <div className="text-right border-t pt-3 text-sm space-y-1 font-medium">
                                        {cart.length > 0 ? (
                                            <>
                                                <p>Subtotal: ₱{formatCurrency(totals.subtotal)}</p>
                                                <p>Discount: ₱{formatCurrency(totals.discount)}</p>
                                                <p>Tax: ₱{formatCurrency(totals.tax)}</p>
                                                <p className="font-semibold">Total: ₱{formatCurrency(totals.total)}</p>
                                                <p className="font-medium">Change: ₱{formatCurrency(totals.change)}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-500">Cart is empty.</p>
                                        )}
                                    </div>

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
                                            onClick={handleVoidClick}
                                            disabled={cart.length === 0}
                                            className="px-4 py-2 ml-2 text-red-500 text-xs hover:underline"
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
            <PosPinModal
                show={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSubmit={handlePinSubmit}
            />
        </div>
    );
}
