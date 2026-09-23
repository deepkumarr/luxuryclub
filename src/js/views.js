// Views renderer module for Luxury Club Multi-Page Views
import { CATEGORIES, PRODUCTS, BRAND_PILLARS } from './catalog.js';
import { store } from './store.js';

export function renderHomeView() {
    renderHomeCategoryShowcases();
    renderHomePillars();
}

// Render Categorized Product Showcase Sections matching original site
function renderHomeCategoryShowcases() {
    const container = document.getElementById('home-categorized-showcases');
    if (!container) return;

    const sections = [
        { id: 'perfume', title: 'Luxury Perfumes (Eau De Parfum)', subtitle: 'High-potency sprays crafted with fine oils & floral notes' },
        { id: 'attar', title: 'Artisanal Roll-On Attars', subtitle: 'Concentrated 100% pure non-alcoholic fragrance oils' },
        { id: 'car-perfume', title: 'Car Hanging Pod Perfumes', subtitle: 'Premium ambient diffusers for an enriched driving atmosphere' },
        { id: 'combo-pack-perfume', title: 'Combo Packs & Gift Sets', subtitle: 'Curated multi-piece fragrance pairings offering maximum luxury' }
    ];

    container.innerHTML = sections.map(sec => {
        const categoryProducts = PRODUCTS.filter(p => p.category === sec.id).slice(0, 4);
        if (categoryProducts.length === 0) return '';

        // Dynamic grid columns to prevent empty gaps on the right when 2 or 3 products exist
        let gridStyle = '';
        if (categoryProducts.length === 2) {
            gridStyle = 'grid-template-columns: repeat(2, 1fr);';
        } else if (categoryProducts.length === 3) {
            gridStyle = 'grid-template-columns: repeat(3, 1fr);';
        }

        return `
            <section class="catalog-section" style="padding: 4.5rem 0; border-bottom: 1px solid var(--border-dark);">
                <div class="container">
                    <div class="section-header reveal-on-scroll" style="margin-bottom: 2.5rem; text-align: left; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap;">
                        <div>
                            <span class="label-gold">${sec.id.toUpperCase()} COLLECTION</span>
                            <h2 class="heading-lg" style="font-size: 2.2rem;">${sec.title}</h2>
                            <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.3rem;">${sec.subtitle}</p>
                        </div>
                        <a href="#/collection/${sec.id}" class="btn-secondary" style="padding: 0.65rem 1.5rem; font-size: 0.75rem;">
                            <span>VIEW ALL ${sec.id.toUpperCase()}</span>
                            <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>

                    <div class="products-grid" style="${gridStyle}">
                        ${categoryProducts.map(prod => {
                            const inWishlist = store.isInWishlist(prod.id);
                            return `
                                <div class="product-card reveal-on-scroll">
                                    <div class="product-image-box">
                                        <span class="discount-tag">${prod.discount}</span>
                                        <button class="wishlist-btn-card ${inWishlist ? 'active' : ''}" onclick="window.store.toggleWishlist('${prod.id}')" title="Wishlist">
                                            <i class="bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                                        </button>
                                        <img src="${prod.image}" alt="${prod.name}" loading="lazy" onclick="window.store.openProductModal('${prod.id}')" style="cursor: pointer;">
                                    </div>
                                    <div class="product-info">
                                        <div>
                                            <span class="product-category">${prod.categoryLabel}</span>
                                            <h3 class="product-name" onclick="window.store.openProductModal('${prod.id}')" style="cursor: pointer;">${prod.name}</h3>
                                            <div style="font-size: 0.75rem; color: var(--accent-gold-light); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.3rem;">
                                                <i class="bi bi-star-fill"></i>
                                                <span style="font-weight: 700;">${prod.rating}</span>
                                                <span style="color: var(--text-dim);">(${prod.reviewsCount})</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="product-price-row">
                                                <span class="sale-price">₹${prod.price}</span>
                                                <span class="original-price">₹${prod.originalPrice}</span>
                                            </div>
                                            <div class="card-actions">
                                                <button class="btn-add-cart" onclick="window.store.addToCart('${prod.id}')">
                                                    <i class="bi bi-bag-plus"></i> ADD TO CART
                                                </button>
                                                <button class="btn-icon" onclick="window.store.openProductModal('${prod.id}')" title="Quick View" style="width: 38px; height: 38px;">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
    }).join('');
}

function renderHomePillars() {
    const container = document.getElementById('home-pillars-grid');
    if (!container) return;

    container.innerHTML = BRAND_PILLARS.map(p => `
        <div class="pillar-card reveal-on-scroll">
            <div class="pillar-number">${p.number}</div>
            <h3 class="pillar-title">${p.title}</h3>
            <p class="pillar-desc">${p.description}</p>
        </div>
    `).join('');
}

export function renderCollectionView(categoryId = 'all') {
    store.activeCategory = categoryId || 'all';

    const bannerTitle = document.getElementById('collection-banner-title');
    const bannerDesc = document.getElementById('collection-banner-desc');
    const selectedCat = CATEGORIES.find(c => c.id === store.activeCategory);

    if (bannerTitle && selectedCat) {
        bannerTitle.textContent = selectedCat.id === 'all' ? 'Our Collection' : selectedCat.name;
        if (bannerDesc) bannerDesc.textContent = selectedCat.description || 'Explore our full line of luxury fragrances.';
    }

    renderCollectionFilterBar();
    renderCollectionProductsGrid();
}

function renderCollectionFilterBar() {
    const container = document.getElementById('collection-page-filter-bar');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
        <button class="filter-btn ${store.activeCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
            ${cat.name}
        </button>
    `).join('');

    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.dataset.catId;
            store.setCategory(catId);
            window.location.hash = `#/collection/${catId}`;
        });
    });
}

function renderCollectionProductsGrid() {
    const container = document.getElementById('collection-page-products-grid');
    if (!container) return;

    const filtered = store.getFilteredProducts();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="bi bi-search" style="font-size: 3rem; color: var(--accent-gold); opacity: 0.5;"></i>
                <h3 class="heading-md" style="margin-top: 1rem;">No Fragrances Found</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Select a different category to explore products.</p>
            </div>
        `;
        return;
    }

    let gridStyle = '';
    if (filtered.length === 2) {
        gridStyle = 'grid-template-columns: repeat(2, 1fr);';
    } else if (filtered.length === 3) {
        gridStyle = 'grid-template-columns: repeat(3, 1fr);';
    }

    container.setAttribute('style', gridStyle);

    container.innerHTML = filtered.map(prod => {
        const inWishlist = store.isInWishlist(prod.id);
        return `
            <div class="product-card reveal-on-scroll">
                <div class="product-image-box">
                    <span class="discount-tag">${prod.discount}</span>
                    <button class="wishlist-btn-card ${inWishlist ? 'active' : ''}" onclick="window.store.toggleWishlist('${prod.id}')" title="Wishlist">
                        <i class="bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </button>
                    <img src="${prod.image}" alt="${prod.name}" loading="lazy" onclick="window.store.openProductModal('${prod.id}')" style="cursor: pointer;">
                </div>
                <div class="product-info">
                    <div>
                        <span class="product-category">${prod.categoryLabel}</span>
                        <h3 class="product-name" onclick="window.store.openProductModal('${prod.id}')" style="cursor: pointer;">${prod.name}</h3>
                        <div style="font-size: 0.75rem; color: var(--accent-gold-light); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.3rem;">
                            <i class="bi bi-star-fill"></i>
                            <span style="font-weight: 700;">${prod.rating}</span>
                            <span style="color: var(--text-dim);">(${prod.reviewsCount})</span>
                        </div>
                    </div>
                    <div>
                        <div class="product-price-row">
                            <span class="sale-price">₹${prod.price}</span>
                            <span class="original-price">₹${prod.originalPrice}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-add-cart" onclick="window.store.addToCart('${prod.id}')">
                                <i class="bi bi-bag-plus"></i> ADD TO CART
                            </button>
                            <button class="btn-icon" onclick="window.store.openProductModal('${prod.id}')" title="Quick View" style="width: 38px; height: 38px;">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
