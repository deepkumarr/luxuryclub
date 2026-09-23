// Main Application Controller — Luxury Club Multi-Page App
import { BRAND_INFO, TESTIMONIALS } from './catalog.js';
import { store } from './store.js';
import { router } from './router.js';
import { 
    initHeaderScroll, 
    initScrollReveals, 
    initCounterAnimation, 
    initHeroSlider, 
    initTestimonialSlider,
    initLuxuryCursor,
    init3DTiltEffect
} from './animations.js';
import { renderHomeView, renderCollectionView } from './views.js';

document.addEventListener('DOMContentLoaded', () => {
    // Expose store globally for inline button onclick handlers
    window.store = store;

    // 1. Initialize Motion, Cursor & Sliders
    initLuxuryCursor();
    initHeaderScroll();
    initScrollReveals();
    initCounterAnimation();
    initHeroSlider(BRAND_INFO.heroBanners);
    initTestimonialSlider(TESTIMONIALS);
    init3DTiltEffect();

    // 2. Initialize Views
    renderHomeView();
    renderCollectionView('all');

    // 3. Listen to Router Page Changes
    window.addEventListener('page-route-changed', (e) => {
        const { route, param } = e.detail;
        if (route === 'collection') {
            renderCollectionView(param || 'all');
        } else if (route === 'home') {
            renderHomeView();
        }
        initScrollReveals();
    });

    // Start Router
    router.init();

    // 4. Subscribe to Store State Updates
    store.subscribe(() => {
        updateBadges();
        renderCartDrawer();
        renderSearchOverlay();
        renderProductModal();
        if (router.currentView === 'collection') {
            renderCollectionView(store.activeCategory);
        }
    });

    updateBadges();
    renderCartDrawer();

    // 5. Setup Action Event Listeners
    setupEventListeners();
});

function updateBadges() {
    const cartBadge = document.getElementById('cart-badge');
    const wishlistBadge = document.getElementById('wishlist-badge');

    if (cartBadge) cartBadge.textContent = store.getCartCount();
    if (wishlistBadge) wishlistBadge.textContent = store.getWishlistCount();
}

function renderCartDrawer() {
    const itemsContainer = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('cart-subtotal-price');

    if (subtotalEl) subtotalEl.textContent = `₹${store.getCartSubtotal().toLocaleString()}`;
    if (!itemsContainer) return;

    if (store.cart.length === 0) {
        itemsContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem;">
                <i class="bi bi-bag-x" style="font-size: 3.5rem; color: var(--accent-gold); opacity: 0.4;"></i>
                <h4 class="heading-md" style="margin-top: 1rem;">Your Bag is Empty</h4>
                <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">Explore our royal collection and discover your signature scent.</p>
            </div>
        `;
        return;
    }

    itemsContainer.innerHTML = store.cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div style="flex-grow: 1;">
                <div style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 700;">${item.categoryLabel}</div>
                <div style="font-family: var(--font-serif); font-size: 1.05rem; font-weight: 600; color: var(--text-ivory); margin-bottom: 0.3rem;">${item.name}</div>
                <div style="font-weight: 700; color: var(--text-ivory); font-size: 0.95rem; margin-bottom: 0.6rem;">₹${item.price}</div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: inline-flex; align-items: center; border: 1px solid var(--border-dark); border-radius: 2px;">
                        <button style="padding: 0.2rem 0.6rem; color: var(--text-cream);" onclick="window.store.updateCartQuantity('${item.id}', -1)">-</button>
                        <span style="padding: 0.2rem 0.6rem; font-size: 0.85rem; font-weight: 700;">${item.quantity}</span>
                        <button style="padding: 0.2rem 0.6rem; color: var(--text-cream);" onclick="window.store.updateCartQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button style="color: #E63946; font-size: 0.8rem;" onclick="window.store.removeFromCart('${item.id}')">
                        <i class="bi bi-trash3"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSearchOverlay() {
    const resultsContainer = document.getElementById('search-results-container');
    if (!resultsContainer) return;

    if (!store.searchQuery) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
                Search perfumes, attars, car pods, and gift combos...
            </div>
        `;
        return;
    }

    const matches = store.getFilteredProducts();

    if (matches.length === 0) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
                No matching fragrances for "${store.searchQuery}".
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = matches.map(prod => `
        <div class="product-card" onclick="window.store.openProductModal('${prod.id}'); window.store.closeSearch();" style="cursor: pointer;">
            <div class="product-image-box" style="aspect-ratio: 1/1; padding: 1rem;">
                <img src="${prod.image}" alt="${prod.name}">
            </div>
            <div class="product-info" style="padding: 1rem;">
                <span class="product-category">${prod.categoryLabel}</span>
                <h4 style="font-family: var(--font-serif); font-size: 1rem; color: var(--text-ivory); margin: 0.2rem 0;">${prod.name}</h4>
                <div class="product-price-row" style="margin-bottom: 0;">
                    <span class="sale-price" style="font-size: 1rem;">₹${prod.price}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProductModal() {
    const modalEl = document.getElementById('product-detail-modal');
    if (!modalEl) return;

    const p = store.selectedProduct;
    if (!p) {
        modalEl.innerHTML = '';
        return;
    }

    const galleryImages = p.images && p.images.length > 0 ? p.images : [p.image];

    modalEl.innerHTML = `
        <button class="btn-icon" id="close-modal-btn" style="position: absolute; top: 1rem; right: 1rem; z-index: 10;">
            <i class="bi bi-x-lg"></i>
        </button>
        <div class="product-modal-grid">
            <div style="background: #111; padding: 2.5rem; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                <img id="modal-main-img" src="${galleryImages[0]}" alt="${p.name}" style="max-height: 380px; width: auto; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.8));">
                ${galleryImages.length > 1 ? `
                    <div style="display: flex; gap: 0.6rem; justify-content: center; margin-top: 1.5rem; overflow-x: auto; padding: 0.5rem 0;">
                        ${galleryImages.slice(0, 5).map((img, i) => `
                            <img src="${img}" class="modal-thumb ${i === 0 ? 'active' : ''}" style="width: 50px; height: 50px; object-fit: contain; background: #181818; border: 1px solid ${i === 0 ? 'var(--accent-gold)' : 'var(--border-dark)'}; border-radius: 4px; cursor: pointer;" onclick="document.getElementById('modal-main-img').src='${img}';">
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div style="padding: 3rem 2.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <span class="label-gold">${p.categoryLabel}</span>
                    <h2 class="heading-lg" style="font-size: 2.2rem; margin-bottom: 0.75rem;">${p.name}</h2>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                        <span style="color: var(--accent-gold-light); font-size: 0.9rem; font-weight: 700;">★ ${p.rating}</span>
                        <span style="color: var(--text-dim); font-size: 0.85rem;">(${p.reviewsCount} Customer Reviews)</span>
                        <span class="discount-tag" style="position: relative; top: 0; left: 0;">${p.discount}</span>
                    </div>

                    <div class="product-price-row" style="margin-bottom: 1.5rem;">
                        <span class="sale-price" style="font-size: 2rem;">₹${p.price}</span>
                        <span class="original-price" style="font-size: 1.25rem;">₹${p.originalPrice}</span>
                    </div>

                    <p style="color: var(--text-cream); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem;">${p.description}</p>

                    ${p.notes ? `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-dark); padding: 1.25rem; border-radius: 4px; margin-bottom: 1.5rem;">
                            <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">FRAGRANCE PYRAMID</div>
                            <div style="font-size: 0.85rem; color: var(--text-cream); margin-bottom: 0.3rem;"><strong>Top Notes:</strong> ${p.notes.top}</div>
                            <div style="font-size: 0.85rem; color: var(--text-cream); margin-bottom: 0.3rem;"><strong>Heart Notes:</strong> ${p.notes.heart}</div>
                            <div style="font-size: 0.85rem; color: var(--text-cream);"><strong>Base Notes:</strong> ${p.notes.base}</div>
                        </div>
                    ` : ''}
                </div>

                <div>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="btn-primary" style="flex-grow: 1;" onclick="window.store.addToCart('${p.id}'); window.store.closeProductModal();">
                            <i class="bi bi-bag-check-fill"></i>
                            <span>ADD TO CART</span>
                        </button>
                        <button class="btn-secondary" onclick="window.store.addToCart('${p.id}'); window.store.closeProductModal(); window.store.openCart();">
                            <span>BUY NOW</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('close-modal-btn')?.addEventListener('click', () => store.closeProductModal());
}

function setupEventListeners() {
    // Header buttons
    document.getElementById('open-cart-btn')?.addEventListener('click', () => store.openCart());
    document.getElementById('close-cart-btn')?.addEventListener('click', () => store.closeCart());
    document.getElementById('cart-drawer-backdrop')?.addEventListener('click', () => store.closeCart());

    document.getElementById('open-search-btn')?.addEventListener('click', () => store.openSearch());
    document.getElementById('close-search-btn')?.addEventListener('click', () => store.closeSearch());

    document.getElementById('open-mobile-nav')?.addEventListener('click', () => store.openMobileNav());
    document.getElementById('close-mobile-nav')?.addEventListener('click', () => store.closeMobileNav());
    document.getElementById('mobile-nav-backdrop')?.addEventListener('click', () => store.closeMobileNav());

    document.getElementById('product-modal-backdrop')?.addEventListener('click', () => store.closeProductModal());

    // Search input typing
    const searchInput = document.getElementById('search-input-field');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            store.setSearchQuery(e.target.value);
        });
    }

    // Header Search Input
    const headerSearchInput = document.getElementById('header-search-input');
    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', (e) => {
            store.openSearch();
            const field = document.getElementById('search-input-field');
            if (field) {
                field.value = e.target.value;
                store.setSearchQuery(e.target.value);
            }
        });
    }

    // Mobile nav links
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => store.closeMobileNav());
    });

    // Online Booking Modal Listeners
    const openBooking = () => {
        document.getElementById('booking-modal-backdrop')?.classList.add('active');
        document.getElementById('booking-modal')?.classList.add('active');
    };
    const closeBooking = () => {
        document.getElementById('booking-modal-backdrop')?.classList.remove('active');
        document.getElementById('booking-modal')?.classList.remove('active');
    };

    document.getElementById('open-booking-btn')?.addEventListener('click', openBooking);
    document.getElementById('close-booking-modal')?.addEventListener('click', closeBooking);
    document.getElementById('booking-modal-backdrop')?.addEventListener('click', closeBooking);
    document.getElementById('footer-booking-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        openBooking();
    });

    // Checkout button
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        if (store.cart.length === 0) {
            alert('Your bag is currently empty.');
            return;
        }
        const total = store.getCartSubtotal();
        alert(`Proceeding to Secure Royal Checkout for Total: ₹${total.toLocaleString()}.\n\nThank you for choosing Luxury Club!`);
    });
}
