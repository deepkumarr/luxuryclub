// Luxury Club Client-Side SPA Hash Router

export class Router {
    constructor() {
        this.routes = {
            'home': 'view-home',
            'aboutus': 'view-about',
            'about': 'view-about',
            'collection': 'view-collection',
            'contact': 'view-contact'
        };
        this.currentView = null;
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    init() {
        this.handleRoute();
    }

    handleRoute() {
        const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
        let [routeName, param] = rawHash.split('/');

        if (!routeName || !this.routes[routeName]) {
            routeName = 'home';
        }

        const targetViewId = this.routes[routeName];

        // Hide all page view containers
        document.querySelectorAll('.page-view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target page view container
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = routeName;
        }

        // Scroll to top cleanly
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active class on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            const route = link.dataset.route;
            if (route === routeName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Trigger custom route change event
        window.dispatchEvent(new CustomEvent('page-route-changed', {
            detail: { route: routeName, param: param }
        }));
    }

    navigate(path) {
        window.location.hash = `#/${path.replace(/^\//, '')}`;
    }
}

export const router = new Router();
