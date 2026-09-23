// Luxury Animations, 3D Tilt & Custom Cursor Interactions

export function initHeaderScroll() {
    const header = document.querySelector('.header-nav');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.style.boxShadow = '0 15px 40px rgba(0,0,0,0.9)';
        } else {
            header.style.boxShadow = 'var(--shadow-wine)';
        }
    }, { passive: true });
}

export function initScrollReveals() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(35px)';
        el.style.transition = 'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)';
        revealObserver.observe(el);
    });

    if (!document.getElementById('reveal-animation-style')) {
        const style = document.createElement('style');
        style.id = 'reveal-animation-style';
        style.textContent = `
            .reveal-on-scroll.revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Re-bind 3D tilt on newly rendered cards
    init3DTiltEffect();
}

// Custom Luxury Cursor Follower
export function initLuxuryCursor() {
    let dot = document.getElementById('luxury-cursor-dot');
    let ring = document.getElementById('luxury-cursor-ring');

    if (!dot) {
        dot = document.createElement('div');
        dot.id = 'luxury-cursor-dot';
        document.body.appendChild(dot);
    }
    if (!ring) {
        ring = document.createElement('div');
        ring.id = 'luxury-cursor-ring';
        document.body.appendChild(ring);
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });

    function renderRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);
}

// 3D Perspective Tilt on Cards & Hero Elements
export function init3DTiltEffect() {
    const tiltableCards = document.querySelectorAll('.product-card, .category-card, .featured-hero-card');

    tiltableCards.forEach(card => {
        if (card.dataset.tiltInitialized) return;
        card.dataset.tiltInitialized = 'true';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// Counter animation
export function initCounterAnimation() {
    const counterEl = document.getElementById('stat-counter-17');
    if (!counterEl) return;

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                animateCounter(counterEl, 0, 17, 2000);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(counterEl);
}

function animateCounter(element, start, end, duration) {
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeProgress * (end - start) + start);
        element.textContent = current + "+";
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end + "+";
        }
    }
    window.requestAnimationFrame(step);
}

// Hero Slider Carousel Controller
export function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const tabs = document.querySelectorAll('.hero-tab-item');
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');
    const progressFill = document.getElementById('hero-progress-fill');
    const container = document.getElementById('hero-slider-container');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let progressTimer = null;
    const slideDuration = 6000;
    const progressInterval = 50;

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            if (i === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        tabs.forEach((tab, i) => {
            if (i === currentIndex) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        resetProgress();
    }

    function resetProgress() {
        if (progressTimer) clearInterval(progressTimer);
        if (!progressFill) return;

        progressFill.style.width = '0%';
        let elapsed = 0;

        progressTimer = setInterval(() => {
            elapsed += progressInterval;
            const pct = Math.min((elapsed / slideDuration) * 100, 100);
            progressFill.style.width = pct + '%';
            if (elapsed >= slideDuration) {
                clearInterval(progressTimer);
            }
        }, progressInterval);
    }

    function startAutoPlay() {
        stopAutoPlay();
        resetProgress();
        autoPlayTimer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, slideDuration);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        if (progressTimer) clearInterval(progressTimer);
        if (progressFill) progressFill.style.width = '0%';
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
            startAutoPlay();
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetIndex = parseInt(tab.dataset.slide);
            if (!isNaN(targetIndex)) {
                goToSlide(targetIndex);
                startAutoPlay();
            }
        });
    });

    if (container) {
        container.addEventListener('mouseenter', () => {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            if (progressTimer) clearInterval(progressTimer);
        });

        container.addEventListener('mouseleave', () => {
            startAutoPlay();
        });

        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                goToSlide(currentIndex + 1);
                startAutoPlay();
            } else if (touchEndX - touchStartX > 50) {
                goToSlide(currentIndex - 1);
                startAutoPlay();
            }
        }, { passive: true });
    }

    goToSlide(0);
    startAutoPlay();
}

// Testimonial slider
export function initTestimonialSlider(testimonials) {
    let currentIndex = 0;
    const container = document.getElementById('testimonial-card-wrap');
    const dotsWrap = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');

    if (!container || !testimonials || testimonials.length === 0) return;

    function renderTestimonial(index) {
        const item = testimonials[index];
        container.innerHTML = `
            <div class="testimonial-card reveal-on-scroll revealed">
                <div class="quote-icon">“</div>
                <p class="testimonial-quote">"${item.quote}"</p>
                <div class="testimonial-author">${item.name}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">${item.role} &bull; ${item.location}</div>
            </div>
        `;

        if (dotsWrap) {
            dotsWrap.innerHTML = testimonials.map((_, i) => `
                <div class="slider-dot ${i === index ? 'active' : ''}" data-index="${i}"></div>
            `).join('');

            dotsWrap.querySelectorAll('.slider-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    currentIndex = parseInt(e.target.dataset.index);
                    renderTestimonial(currentIndex);
                });
            });
        }
    }

    renderTestimonial(currentIndex);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            renderTestimonial(currentIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            renderTestimonial(currentIndex);
        });
    }
}
