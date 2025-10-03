import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const features = [
        { title: 'Buy License', description: 'Get your Hero POS license and unlock all features.', link: '/buy-license', icon: '🛒' },
        { title: 'About', description: 'Learn more about Hero POS and our mission.', link: '/about', icon: 'ℹ️' },
        { title: 'Packages', description: 'Check out our pricing and packages.', link: '/packages', icon: '📦' },
        { title: 'Support', description: 'Get help and support for your Hero POS system.', link: '/support', icon: '🆘' },
        { title: 'Features', description: 'Discover all features included in Hero POS.', link: '/features', icon: '✨' },
        { title: 'Contact Us', description: 'Reach out for inquiries or partnership.', link: '/contact', icon: '📞' },
    ];

    const showcases = [
        { title: 'Dashboard', description: 'Monitor your sales, revenue, and business insights in real-time.', img: 'https://via.placeholder.com/800x400.png?text=Dashboard' },
        { title: 'Products', description: 'Easily manage your products, stock, and categories.', img: 'https://via.placeholder.com/800x400.png?text=Products' },
        { title: 'Sales', description: 'Track daily, weekly, and monthly sales effortlessly.', img: 'https://via.placeholder.com/800x400.png?text=Sales' },
        { title: 'Transactions', description: 'View all transactions with detailed information.', img: 'https://via.placeholder.com/800x400.png?text=Transactions' },
        { title: 'POS Page', description: 'Quickly complete sales using the intuitive POS interface.', img: 'https://via.placeholder.com/800x400.png?text=POS+Page' },
    ];

    return (
        <>
            <Head title="Welcome | Hero POS" />
            <div className="bg-white text-gray-800 min-h-screen selection:bg-purple-500 selection:text-white">
                <div className="relative flex flex-col items-center justify-center py-16 px-6 lg:px-20">

                    {/* Header */}
                    <header className="flex flex-col lg:flex-row w-full justify-between items-center mb-12">
                        <div className="text-center lg:text-left mb-6 lg:mb-0">
                            <h1 className="text-4xl font-bold text-purple-600">Hero POS</h1>
                            <p className="mt-2 text-gray-600">Next-generation Point of Sale system</p>
                        </div>
                        <nav className="flex gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 rounded-md border border-purple-600 text-purple-600 hover:bg-purple-50 transition"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero / Banner Section */}
                    <section className="flex flex-col-reverse lg:flex-row items-center justify-between w-full bg-purple-50 p-10 rounded-xl mb-16 shadow-lg">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <h2 className="text-5xl font-bold text-purple-700 mb-4">Simplify Your Business with Hero POS</h2>
                            <p className="text-gray-700 mb-6 text-lg">
                                Streamline your sales, manage inventory, and monitor your business in real-time. Everything you need in one system.
                            </p>
                            <div className="flex justify-center lg:justify-start gap-4">
                                <Link
                                    href="/buy-license"
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                                >
                                    Buy License
                                </Link>
                                <Link
                                    href="/features"
                                    className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                        <div className="lg:w-1/2 mb-6 lg:mb-0 flex justify-center">
                            <img
                                src="https://via.placeholder.com/400x300.png?text=Hero+POS"
                                alt="Hero POS Illustration"
                                className="rounded-xl shadow-md"
                            />
                        </div>
                    </section>

                    {/* System Showcase Section - Bigger */}
                    <section className="w-full mb-16">
                        <h3 className="text-3xl font-bold text-purple-600 text-center mb-10">Explore the Hero POS System</h3>
                        <div className="flex flex-col gap-16">
                            {showcases.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col lg:flex-row items-center justify-between bg-purple-50 rounded-xl shadow-lg overflow-hidden"
                                >
                                    <div className="lg:w-1/2 p-8 text-center lg:text-left">
                                        <h4 className="text-4xl font-bold text-purple-700 mb-4">{item.title}</h4>
                                        <p className="text-gray-700 text-lg">{item.description}</p>
                                    </div>
                                    <div className="lg:w-1/2">
                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Feature Cards */}
                    <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
                        {features.map((feature, idx) => (
                            <a
                                key={idx}
                                href={feature.link}
                                className="flex flex-col items-start gap-4 p-6 bg-purple-50 hover:bg-purple-100 rounded-xl shadow-md transition"
                            >
                                <div className="text-purple-600 text-4xl">{feature.icon}</div>
                                <h2 className="text-xl font-semibold">{feature.title}</h2>
                                <p className="text-gray-700">{feature.description}</p>
                            </a>
                        ))}
                    </main>

                    {/* Footer */}
                    <footer className="mt-16 text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Hero POS. All rights reserved.
                    </footer>
                </div>
            </div>
        </>
    );
}
