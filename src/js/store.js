// Luxury Club State & Store Manager
import { PRODUCTS } from './catalog.js';

class LuxuryStore {
    constructor() {
        this.cart = this.loadLocalStorage('luxury_cart', []);
        this.wishlist = this.loadLocalStorage('luxury_wishlist', []);
        this.activeCategory = 'all';
        this.searchQuery = '';
        this.selectedProduct = null;
        this.listeners = new Set();
    }

    loadLocalStorage(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    saveLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage save error:', e);
        }
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(fn => fn(this));
    }

    // --- CART METHODS ---
    addToCart(productId, quantity = 1) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existingIndex = this.cart.findIndex(item => item.id === productId);
        if (existingIndex > -1) {
            this.cart[existingIndex].quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                categoryLabel: product.categoryLabel,
                quantity: quantity
            });
        }

        this.saveLocalStorage('luxury_cart', this.cart);
        this.notify();
        this.openCart();
    }

    updateCartQuantity(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.id !== productId);
        }

        this.saveLocalStorage('luxury_cart', this.cart);
        this.notify();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.saveLocalStorage('luxury_cart', this.cart);
        this.notify();
    }

    getCartCount() {
        return this.cart.reduce((sum, i) => sum + i.quantity, 0);
    }

    getCartSubtotal() {
        return this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    }

    // --- WISHLIST METHODS ---
    toggleWishlist(productId) {
        const index = this.wishlist.indexOf(productId);
        if (index > -1) {
            this.wishlist.splice(index, 1);
        } else {
            this.wishlist.push(productId);
        }
        this.saveLocalStorage('luxury_wishlist', this.wishlist);
        this.notify();
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    getWishlistCount() {
        return this.wishlist.length;
    }

    // --- FILTER & SEARCH METHODS ---
    setCategory(categoryId) {
        this.activeCategory = categoryId;
        this.notify();
    }

    setSearchQuery(query) {
        this.searchQuery = query.trim().toLowerCase();
        this.notify();
    }

    getFilteredProducts() {
        return PRODUCTS.filter(p => {
            const matchesCategory = this.activeCategory === 'all' || p.category === this.activeCategory;
            const matchesSearch = !this.searchQuery || 
                p.name.toLowerCase().includes(this.searchQuery) ||
                p.categoryLabel.toLowerCase().includes(this.searchQuery) ||
                p.description.toLowerCase().includes(this.searchQuery);
            return matchesCategory && matchesSearch;
        });
    }

    // --- MODALS & DRAWERS ---
    openProductModal(productId) {
        this.selectedProduct = PRODUCTS.find(p => p.id === productId) || null;
        document.getElementById('product-modal-backdrop')?.classList.add('active');
        document.getElementById('product-detail-modal')?.classList.add('active');
        this.notify();
    }

    closeProductModal() {
        this.selectedProduct = null;
        document.getElementById('product-modal-backdrop')?.classList.remove('active');
        document.getElementById('product-detail-modal')?.classList.remove('active');
        this.notify();
    }

    openCart() {
        document.getElementById('cart-drawer-backdrop')?.classList.add('active');
        document.getElementById('cart-drawer')?.classList.add('active');
    }

    closeCart() {
        document.getElementById('cart-drawer-backdrop')?.classList.remove('active');
        document.getElementById('cart-drawer')?.classList.remove('active');
    }

    openSearch() {
        document.getElementById('search-overlay')?.classList.add('active');
        setTimeout(() => document.getElementById('search-input-field')?.focus(), 100);
    }

    closeSearch() {
        document.getElementById('search-overlay')?.classList.remove('active');
    }

    openMobileNav() {
        document.getElementById('mobile-nav-backdrop')?.classList.add('active');
        document.getElementById('mobile-nav-drawer')?.classList.add('active');
    }

    closeMobileNav() {
        document.getElementById('mobile-nav-backdrop')?.classList.remove('active');
        document.getElementById('mobile-nav-drawer')?.classList.remove('active');
    }
}

export const store = new LuxuryStore();
