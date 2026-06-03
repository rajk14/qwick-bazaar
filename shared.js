/**
 * QuickBazar Shared Core Script
 * Handles:
 * 1. Persistent state for Cart (localStorage)
 * 2. Persistent state for Delivery Location
 * 3. Dynamic Injection of Premium Header, Footer, and Mobile Navigation
 * 4. Location Selector Modal & Address Pincode Checkers
 * 5. Smooth Theme transitions (Dark/Light mode support)
 */

// Initialize Cart System
const CartSystem = {
    get() {
        const cart = localStorage.getItem('qb_cart');
        return cart ? JSON.parse(cart) : [];
    },
    save(cart) {
        localStorage.setItem('qb_cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    },
    add(product) {
        const cart = this.get();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        this.save(cart);
        this.showToast(`Added ${product.name} to cart!`);
    },
    remove(id) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== id);
        this.save(cart);
    },
    updateQty(id, qty) {
        const cart = this.get();
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, qty);
            this.save(cart);
        }
    },
    clear() {
        this.save([]);
    },
    getCount() {
        return this.get().reduce((sum, item) => sum + item.quantity, 0);
    },
    getTotal() {
        return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    showToast(message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'bg-primary text-on-primary px-6 py-3 rounded-full font-label-md text-label-md shadow-lg flex items-center gap-2 animate-bounce pointer-events-auto';
        toast.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// Location System
const LocationSystem = {
    get() {
        return localStorage.getItem('qb_location') || 'Indiranagar, Bengaluru';
    },
    save(location) {
        localStorage.setItem('qb_location', location);
        window.dispatchEvent(new CustomEvent('locationUpdated', { detail: location }));
    },
    checkService(pincode) {
        const validPincodes = ['560038', '560008', '560034', '110001', '400001', '500001', '812001', '812002', '812003'];
        return validPincodes.includes(pincode.trim());
    }
};

// UI Injector
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('qb_dark_mode');
    injectLayout();
    setupNavigationDrawer();
    setupLocationModal();
    updateActiveLinks();
    
    // Listen to changes to sync cart badge dynamically
    window.addEventListener('cartUpdated', () => {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = CartSystem.getCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        const cartTotalSpan = document.getElementById('cart-total-nav');
        if (cartTotalSpan) {
            cartTotalSpan.textContent = `₹${CartSystem.getTotal()}`;
        }
    });

    window.addEventListener('locationUpdated', (e) => {
        const locTexts = document.querySelectorAll('.selected-location-text');
        locTexts.forEach(el => {
            el.textContent = e.detail;
        });
    });
});

function injectLayout() {
    const currentPath = window.location.pathname;
    const isHomePath = currentPath.endsWith('/') || currentPath.endsWith('/index.html') || currentPath === '';
    const isPageActive = (path) => (path === 'index.html' ? isHomePath : currentPath.endsWith(path)) ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed';

    // Inject CSS Tailwind Config or Material Symbols if not present
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // Header Injection
    const headerPlaceholder = document.getElementById('global-header');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
        <header class="fixed top-0 w-full z-50 shadow-sm bg-white/95 dark:bg-surface-container/95 backdrop-blur-md h-20 flex items-center transition-colors border-b border-outline-variant/30">
            <nav class="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto">
                <div class="flex items-center gap-8">
                    <div class="flex items-center gap-3">
                        <button id="open-menu-drawer" class="w-10 h-10 rounded-full border border-outline-variant bg-white dark:bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center justify-center" aria-label="Open navigation menu" aria-controls="qb-menu-drawer" aria-expanded="false">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <a class="text-headline-md font-headline-md font-extrabold text-primary dark:text-primary-fixed tracking-tight" href="index.html">QuickBazar</a>
                    </div>
                    
                    <!-- Location Selector -->
                    <a class="hidden md:flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full cursor-pointer hover:bg-surface-container transition-all group" id="open-location-picker" href="location.html">
                        <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">location_on</span>
                        <span class="font-label-md text-on-surface selected-location-text text-sm max-w-[150px] truncate">${LocationSystem.get()}</span>
                        <span class="material-symbols-outlined text-outline-variant group-hover:text-primary text-sm transition-colors">keyboard_arrow_down</span>
                    </a>

                    <!-- Navigation Links -->
                    <div class="hidden lg:flex gap-6 items-center">
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('index.html')}" href="index.html">Home</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('partner.html')}" href="partner.html">Partner</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('property.html')}" href="property.html">Property</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('rider.html')}" href="rider.html">Rider</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('serviceability.html')}" href="serviceability.html">Areas</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('blog.html')}" href="blog.html">Blog</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('about.html')}" href="about.html">About</a>
                        <a class="text-label-md font-label-md transition-colors ${isPageActive('support.html')}" href="support.html">Help</a>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <a href="login.html" class="hidden sm:block text-label-md font-label-md px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors">Login</a>
                    
                    <!-- Cart Indicator -->
                    <a href="cart.html" class="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md hover:bg-primary-container transition-all flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95">
                        <span class="relative flex items-center justify-center">
                            <span class="material-symbols-outlined text-xl">shopping_cart</span>
                            <span id="cart-badge" class="absolute -top-2.5 -right-2.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow" style="display: ${CartSystem.getCount() > 0 ? 'flex' : 'none'}">${CartSystem.getCount()}</span>
                        </span>
                        <span class="hidden md:inline font-bold text-sm" id="cart-total-nav">₹${CartSystem.getTotal()}</span>
                    </a>
                </div>
            </nav>
        </header>
        `;
    }

    // Footer Injection
    const footerPlaceholder = document.getElementById('global-footer');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
        <footer class="bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline pt-16 pb-12 transition-colors">
            <div class="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                <!-- Branding column -->
                <div class="lg:col-span-2 space-y-6">
                    <a class="text-headline-md font-headline-md font-extrabold text-primary dark:text-primary-fixed tracking-tight" href="index.html">QuickBazar</a>
                    <p class="text-body-md text-on-surface-variant dark:text-outline-variant max-w-sm">
                        India's premier hyperlocal quick-commerce platform. Connecting neighborhood vendors, super-fast riders, and household needs within 10 minutes.
                    </p>
                    <div class="flex gap-4">
                        <a class="w-10 h-10 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary flex items-center justify-center text-primary transition-all shadow-sm" href="#" aria-label="Facebook">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                        </a>
                        <a class="w-10 h-10 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary flex items-center justify-center text-primary transition-all shadow-sm" href="#" aria-label="Twitter">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </a>
                        <a class="w-10 h-10 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary flex items-center justify-center text-primary transition-all shadow-sm" href="#" aria-label="Instagram">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </a>
                    </div>
                </div>

                <!-- Fast Links -->
                <div>
                    <h4 class="font-bold text-title-lg text-on-surface dark:text-inverse-on-surface mb-6">Partnerships</h4>
                    <ul class="space-y-3">
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="partner.html">Partner Store Onboarding</a></li>
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="property.html">Lease Your Property</a></li>
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="rider.html">Become a Rider</a></li>
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="about.html">Investor Relations</a></li>
                    </ul>
                </div>

                <!-- Support & Company -->
                <div>
                    <h4 class="font-bold text-title-lg text-on-surface dark:text-inverse-on-surface mb-6">Support & Company</h4>
                    <ul class="space-y-3">
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="support.html">Help Center</a></li>
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="about.html">About & Contact Us</a></li>
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="serviceability.html">Delivery Areas</a></li>
                        <li><a class="text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all" href="legal.html">Legal & Agreements</a></li>
                    </ul>
                </div>

                <!-- App Download -->
                <div class="space-y-4">
                    <h4 class="font-bold text-title-lg text-on-surface dark:text-inverse-on-surface mb-6">Download App</h4>
                    <a href="#" class="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-md hover:scale-[1.02] transition-transform w-48">
                        <span class="material-symbols-outlined text-2xl text-white">play_arrow</span>
                        <div class="text-left"><p class="text-[9px] leading-none text-gray-400">GET IT ON</p><p class="text-sm font-bold">Google Play</p></div>
                    </a>
                    <a href="#" class="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-md hover:scale-[1.02] transition-transform w-48">
                        <span class="material-symbols-outlined text-2xl text-white">phone_iphone</span>
                        <div class="text-left"><p class="text-[9px] leading-none text-gray-400">DOWNLOAD ON THE</p><p class="text-sm font-bold">App Store</p></div>
                    </a>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8 pt-8 border-t border-outline-variant dark:border-outline flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                <p class="text-xs text-on-surface-variant dark:text-outline-variant">&copy; 2026 QuickBazar Technologies Pvt. Ltd. Fast. Fresh. Local.</p>
                <div class="flex gap-6">
                    <a class="text-xs text-on-surface-variant dark:text-outline-variant hover:text-primary underline" href="legal.html">Privacy Policy</a>
                    <a class="text-xs text-on-surface-variant dark:text-outline-variant hover:text-primary underline" href="legal.html">Terms of Service</a>
                    <a class="text-xs text-on-surface-variant dark:text-outline-variant hover:text-primary underline" href="legal.html">Refund Policy</a>
                </div>
            </div>
        </footer>
        `;
    }

    // Mobile Footer Navigation Shell Injection
    const mobileNavPlaceholder = document.getElementById('mobile-footer-nav');
    if (mobileNavPlaceholder) {
        mobileNavPlaceholder.innerHTML = `
        <div class="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-surface-container border-t border-outline-variant shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center h-16 px-4">
            <a class="flex flex-col items-center gap-1 ${currentPath.endsWith('index.html') ? 'text-primary' : 'text-on-surface-variant'}" href="index.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
                <span class="text-[9px] font-bold">Home</span>
            </a>
            <a class="flex flex-col items-center gap-1 ${currentPath.endsWith('partner.html') ? 'text-primary' : 'text-on-surface-variant'}" href="partner.html">
                <span class="material-symbols-outlined">storefront</span>
                <span class="text-[9px] font-bold">Partner</span>
            </a>
            <a class="flex flex-col items-center gap-1 ${currentPath.endsWith('rider.html') ? 'text-primary' : 'text-on-surface-variant'}" href="rider.html">
                <span class="material-symbols-outlined">electric_scooter</span>
                <span class="text-[9px] font-bold">Rider</span>
            </a>
            <a class="flex flex-col items-center gap-1 ${currentPath.endsWith('serviceability.html') ? 'text-primary' : 'text-on-surface-variant'}" href="serviceability.html">
                <span class="material-symbols-outlined">travel_explore</span>
                <span class="text-[9px] font-bold">Areas</span>
            </a>
            <a class="flex flex-col items-center gap-1 ${currentPath.endsWith('cart.html') ? 'text-primary' : 'text-on-surface-variant'}" href="cart.html">
                <span class="material-symbols-outlined relative">
                    shopping_cart
                    <span id="cart-badge-mobile" class="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow" style="display: ${CartSystem.getCount() > 0 ? 'flex' : 'none'}">${CartSystem.getCount()}</span>
                </span>
                <span class="text-[9px] font-bold">Cart</span>
            </a>
        </div>
        `;
        window.addEventListener('cartUpdated', () => {
            const badgeM = document.getElementById('cart-badge-mobile');
            if (badgeM) {
                const count = CartSystem.getCount();
                badgeM.textContent = count;
                badgeM.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }
}

function setupNavigationDrawer() {
    if (!document.getElementById('qb-menu-drawer')) {
        const shell = document.createElement('div');
        shell.id = 'qb-menu-shell';
        shell.innerHTML = `
        <div class="fixed inset-0 z-[90] bg-[#121c2a]/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300" id="qb-menu-overlay"></div>
        <aside class="fixed top-0 left-0 z-[100] h-full w-[85%] max-w-[380px] bg-surface-container-lowest dark:bg-surface-container shadow-2xl transform -translate-x-full transition-transform duration-300 ease-out flex flex-col" id="qb-menu-drawer" aria-hidden="true">
            <div class="p-6 pt-10 pb-6 bg-surface dark:bg-surface-container-low border-b border-outline-variant">
                <div class="flex items-center gap-6 mb-6">
                    <div class="relative">
                        <img alt="Rahul S." class="w-16 h-16 rounded-full object-cover border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXT37DJfroSvJXzoIdn8Q3Tovkscn5yNvin3egfGMDoJCHv6K1imFXMtH3VR4B82bokYMoatNrr6i_lWh05xXQBD-PMpRe1VMyQm9iP1NCnY6XvaivglLlF_ExL4cP8lszLbKddubcuaKPYt4HVYzUa-LrBli_JRz6BB3WbNHnJueQYW-4zZ0yuz0ZwUg9f28OLaI9sHFEkP4mc2SLuVDtZg0FBz9wjvvSmZahDUkaNDeeI088C07UBoJ202meRxtke6EaAm7f0TTc"/>
                        <div class="absolute -bottom-1 -right-1 bg-secondary-container p-1 rounded-full border-2 border-surface">
                            <span class="material-symbols-outlined text-[16px] text-on-secondary-container" style="font-variation-settings: 'FILL' 1;">verified</span>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h2 class="font-bold text-2xl text-on-surface truncate">Rahul S.</h2>
                        <p class="font-semibold text-sm text-on-surface-variant truncate">+91 98765 43210</p>
                    </div>
                    <a href="login.html" class="p-2 hover:bg-surface-container rounded-full transition-colors" aria-label="Edit profile">
                        <span class="material-symbols-outlined text-on-surface-variant">edit</span>
                    </a>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-2 py-6 space-y-1">
                <div class="px-6 mb-6">
                    <div class="bg-gradient-to-br from-secondary-container to-secondary text-on-secondary-container p-6 rounded-xl shadow-sm relative overflow-hidden group cursor-pointer transition-transform active:scale-95">
                        <div class="relative z-10">
                            <p class="font-medium text-xs uppercase mb-1 opacity-80">Premium Access</p>
                            <h3 class="font-semibold text-xl mb-1">QuickBazar Gold</h3>
                            <p class="text-[13px] leading-tight mb-6">Get free delivery on every order and exclusive rewards.</p>
                            <button class="bg-surface-container-lowest text-on-surface font-semibold px-6 py-1 rounded-full text-xs shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-colors" type="button">Upgrade Now</button>
                        </div>
                        <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-10 rotate-12" style="font-variation-settings: 'FILL' 1;">stars</span>
                    </div>
                </div>

                <nav class="space-y-1" aria-label="Menu drawer">
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="cart.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
                        <span class="font-semibold text-sm flex-1">My Orders</span>
                        <span class="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                    </a>
                    <a class="qb-drawer-link w-[calc(100%-1rem)] flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group text-left" href="location.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">location_on</span>
                        <span class="font-semibold text-sm flex-1">My Addresses</span>
                        <span class="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                    </a>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="cart.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">account_balance_wallet</span>
                        <span class="font-semibold text-sm flex-1">Wallet/Payments</span>
                        <span class="bg-primary-container/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">₹450</span>
                    </a>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="support.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">support_agent</span>
                        <span class="font-semibold text-sm flex-1">Help Center</span>
                    </a>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="serviceability.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">travel_explore</span>
                        <span class="font-semibold text-sm flex-1">Delivery Areas</span>
                    </a>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="property.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">warehouse</span>
                        <span class="font-semibold text-sm flex-1">Lease Property</span>
                    </a>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="bhagalpur.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">store</span>
                        <span class="font-semibold text-sm flex-1">Bhagalpur Store</span>
                    </a>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group" href="about.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">info</span>
                        <span class="font-semibold text-sm flex-1">About Us</span>
                    </a>
                    <div class="my-6 mx-6 border-t border-outline-variant"></div>
                    <a class="qb-drawer-link flex items-center gap-6 px-6 py-6 mx-2 rounded-xl text-error hover:bg-error-container/10 transition-all group" href="login.html">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">logout</span>
                        <span class="font-semibold text-sm flex-1">Log Out</span>
                    </a>
                </nav>
            </div>

            <div class="p-6 bg-surface-container-low dark:bg-surface-container">
                <div class="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg flex items-center gap-3 mb-6">
                    <div class="bg-primary-container/10 p-2 rounded-lg">
                        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">redeem</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-medium text-[11px] leading-tight text-on-surface-variant">Refer a friend and earn</p>
                        <p class="font-semibold text-[13px] text-primary">Get ₹100 Discount</p>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/40">chevron_right</span>
                </div>
                <div class="flex justify-between items-center">
                    <div class="flex gap-6">
                        <a class="text-on-surface-variant hover:text-primary transition-colors" href="#" aria-label="Instagram">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </a>
                        <a class="text-on-surface-variant hover:text-primary transition-colors" href="#" aria-label="Twitter">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </a>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-[10px] text-on-surface-variant/60">Version 4.12.0</p>
                        <p class="font-medium text-[10px] text-on-surface-variant/40">Made in India</p>
                    </div>
                </div>
            </div>
        </aside>
        <button class="fixed top-6 right-6 z-[110] p-2 bg-surface rounded-full shadow-lg text-on-surface transition-all hover:scale-110 active:scale-90 opacity-0 pointer-events-none md:hidden" id="close-menu-drawer" aria-label="Close navigation menu">
            <span class="material-symbols-outlined">close</span>
        </button>
        `;
        document.body.appendChild(shell);
    }

    const drawer = document.getElementById('qb-menu-drawer');
    const overlay = document.getElementById('qb-menu-overlay');
    const openBtn = document.getElementById('open-menu-drawer');
    const closeBtn = document.getElementById('close-menu-drawer');

    if (!drawer || !overlay || !openBtn || openBtn.dataset.drawerBound === 'true') return;
    openBtn.dataset.drawerBound = 'true';

    const setDrawerOpen = (open) => {
        drawer.classList.toggle('-translate-x-full', !open);
        drawer.classList.toggle('translate-x-0', open);
        overlay.classList.toggle('opacity-0', !open);
        overlay.classList.toggle('pointer-events-none', !open);
        overlay.classList.toggle('opacity-100', open);
        closeBtn.classList.toggle('opacity-0', !open);
        closeBtn.classList.toggle('pointer-events-none', !open);
        drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
        openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('overflow-hidden', open);
    };

    openBtn.addEventListener('click', () => setDrawerOpen(true));
    overlay.addEventListener('click', () => setDrawerOpen(false));
    closeBtn.addEventListener('click', () => setDrawerOpen(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('translate-x-0')) {
            setDrawerOpen(false);
        }
    });

    drawer.querySelectorAll('.qb-drawer-link').forEach((item) => {
        item.addEventListener('touchstart', () => item.classList.add('scale-[0.98]'), { passive: true });
        item.addEventListener('touchend', () => item.classList.remove('scale-[0.98]'), { passive: true });
        item.addEventListener('click', () => setDrawerOpen(false));
    });
}

// Location Selector Modal Setup
function setupLocationModal() {
    // Create Location modal dynamically if it doesn't exist
    let modal = document.getElementById('location-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'location-modal';
        modal.className = 'fixed inset-0 z-[110] flex items-center justify-center bg-black/60 hidden';
        modal.innerHTML = `
        <div class="bg-surface dark:bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full mx-4 relative transform scale-95 transition-all duration-300">
            <button class="absolute top-4 right-4 text-outline hover:text-primary transition-colors" id="close-location-modal">
                <span class="material-symbols-outlined text-2xl">close</span>
            </button>
            <div class="mb-6">
                <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-primary text-2xl">my_location</span>
                </div>
                <h3 class="text-headline-md font-headline-md text-on-surface">Select Delivery Location</h3>
                <p class="text-body-md text-on-surface-variant mt-2">Enter your pincode or area address to find neighborhood stores.</p>
            </div>
            <div class="space-y-4">
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
                    <input type="text" id="pincode-input" class="w-full bg-white dark:bg-surface-container-lowest border border-outline-variant pl-10 pr-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-label-md" placeholder="Enter Pincode (e.g. 560034)">
                </div>
                <button id="submit-location" class="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-xl font-bold transition-all hover:scale-[1.01]">Check Availability</button>
                
                <div class="border-t border-outline-variant pt-4 mt-2">
                    <p class="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Serving Zones:</p>
                    <div class="grid grid-cols-2 gap-2 text-xs text-on-surface">
                        <span class="flex items-center gap-1 text-on-surface-variant"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> Indiranagar (560038)</span>
                        <span class="flex items-center gap-1 text-on-surface-variant"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> Koramangala (560034)</span>
                        <span class="flex items-center gap-1 text-on-surface-variant"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> Halasuru (560008)</span>
                        <span class="flex items-center gap-1 text-on-surface-variant"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span> Connaught Place (110001)</span>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    const openBtns = document.querySelectorAll('.location-trigger-btn');
    const closeBtn = document.getElementById('close-location-modal');
    const submitBtn = document.getElementById('submit-location');
    const pincodeInput = document.getElementById('pincode-input');

    const toggleModal = (show) => {
        if (show) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
        } else {
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 200);
        }
    };

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleModal(true);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const pincode = pincodeInput.value;
            if (!pincode) return alert('Please enter a valid pincode or location!');
            
            if (LocationSystem.checkService(pincode)) {
                let text = pincode === '560034' ? 'Koramangala, Bengaluru' :
                           pincode === '560038' ? 'Indiranagar, Bengaluru' :
                           pincode === '560008' ? 'Halasuru, Bengaluru' :
                           pincode === '110001' ? 'Connaught Place, Delhi' : 'Indiranagar, Bengaluru';
                
                LocationSystem.save(text);
                toggleModal(false);
                CartSystem.showToast(`Delivery location set to ${text}!`);
            } else {
                alert(`Apologies! QuickBazar is currently not serving area: ${pincode}. Try checking: 560038, 560034, or 110001.`);
            }
        });
    }
}

// Force active navigation link update
function updateActiveLinks() {
    const currentPath = window.location.pathname;
    const isHomePath = currentPath.endsWith('/') || currentPath.endsWith('/index.html') || currentPath === '';
    const links = document.querySelectorAll('header nav a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentPath.endsWith(href) || (href === 'index.html' && isHomePath))) {
            link.className = 'text-label-md font-label-md font-bold text-primary dark:text-primary-fixed border-b-2 border-primary pb-1';
        }
    });
}
