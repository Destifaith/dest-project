import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
}: PageProps) {
    return (
        <>
            <Head title="Welcome to Hospitality Answer" />
            <div className="bg-gradient-to-br from-green-50 to-cyan-100 text-gray-800 dark:from-gray-900 dark:to-green-900 dark:text-white/90">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                <div className="relative flex min-h-screen flex-col items-center justify-center">
                    <div className="relative w-full max-w-6xl px-6">
                        {/* Header */}
                        <header className="flex items-center justify-between py-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-green-800 dark:text-white">Hospitality Answer</span>
                            </div>

                            <nav className="flex items-center gap-6">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-white px-6 py-2 font-semibold text-green-700 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px] dark:bg-gray-800 dark:text-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex gap-4">
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-6 py-2 font-semibold text-green-700 transition-all hover:text-green-800 dark:text-white dark:hover:text-green-200"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl hover:translate-y-[-2px]"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </header>

                        {/* Hero Section */}
                        <main className="py-16">
                            <div className="text-center">
                                <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white lg:text-6xl">
                                    Experience Unforgettable
                                    <span className="block bg-gradient-to-r from-green-600 to-cyan-500 bg-clip-text text-transparent">
                                        Hospitality
                                    </span>
                                </h1>

                                <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-600 dark:text-gray-300 lg:text-2xl">
                                    Where luxury meets comfort, and every moment is crafted to perfection.
                                    Discover the art of exceptional service.
                                </p>

                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:bg-green-700 hover:shadow-3xl hover:translate-y-[-2px]"
                                    >
                                        Book Your Stay
                                    </Link>
                                    <Link
                                        href="#features"
                                        className="rounded-full border-2 border-green-600 px-8 py-4 text-lg font-semibold text-green-600 transition-all hover:bg-green-600 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900"
                                    >
                                        Explore Amenities
                                    </Link>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div id="features" className="mt-20 grid gap-8 lg:grid-cols-3">
                                {/* Luxury Accommodations */}
                                <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-4px] dark:bg-gray-800">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                        Luxury Accommodations
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Indulge in our exquisite rooms and suites, each designed with
                                        elegant furnishings, premium amenities, and breathtaking views
                                        to ensure your ultimate comfort.
                                    </p>
                                </div>

                                {/* Culinary Excellence */}
                                <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-4px] dark:bg-gray-800">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                        Culinary Excellence
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Savor world-class dining experiences with our award-winning
                                        restaurants, featuring locally-sourced ingredients and
                                        masterfully crafted menus by renowned chefs.
                                    </p>
                                </div>

                                {/* Premium Services */}
                                <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-4px] dark:bg-gray-800">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                        Premium Services
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Experience unparalleled service with our dedicated concierge,
                                        spa treatments, and personalized attention to make your stay
                                        truly memorable and stress-free.
                                    </p>
                                </div>
                            </div>

                            {/* Testimonial Section */}
                            <div className="mt-20 rounded-2xl bg-gradient-to-r from-green-600 to-cyan-500 p-12 text-white">
                                <div className="text-center">
                                    <svg className="mx-auto mb-4 h-8 w-8 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                                    </svg>
                                    <p className="mb-6 text-2xl italic">
                                        "An extraordinary experience from start to finish. The attention to detail
                                        and exceptional service made our stay absolutely perfect. We can't wait to return!"
                                    </p>
                                    <div className="font-semibold">
                                        <div className="text-lg">Sarah Johnson</div>
                                        <div className="text-green-100">Guest Experience</div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Footer */}
                        <footer className="py-12 text-center">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="text-gray-600 dark:text-gray-400">
                                    © 2025 Hospitality Answer. All rights reserved.
                                </div>
                                <div className="flex gap-6">
                                    <a href="#" className="text-gray-600 transition hover:text-green-600 dark:text-gray-400 dark:hover:text-white">
                                        Privacy Policy
                                    </a>
                                    <a href="#" className="text-gray-600 transition hover:text-green-600 dark:text-gray-400 dark:hover:text-white">
                                        Terms of Service
                                    </a>
                                    <a href="#" className="text-gray-600 transition hover:text-green-600 dark:text-gray-400 dark:hover:text-white">
                                        Contact Us
                                    </a>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
