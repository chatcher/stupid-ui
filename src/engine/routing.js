import { defaultRoutes } from './default-routes.js';
import { routes } from '../routes.js';
import { loader } from './loader.js';

console.log('client-side routing', { routes });

class StupidRouterView extends HTMLElement {
	constructor() {
		super();
		console.log('StupidRouterView::constructor()');
		this.innerHTML = `<p>Loading...</p>`;
	}

	connectedCallback() {
		console.log('StupidRouterView::connected()');
	}

	disconnectedCallback() {
		console.log('StupidRouterView::disconnected()');
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log('StupidRouterView::update()', name, oldValue, newValue);
	}

	adoptedCallback() {
		console.log('StupidRouterView::adopted()');
	}

	async loadRoute(route) {
		console.log({ route });
		if (!route) throw new Error('Cannot load empty route');
		if (!route.name) throw new Error('Cannot load unnamed route');
		await loader.loadTemplate(route);
		this.innerHTML = `<${route.name} />`;
	}
}

customElements.define('stupid-router-view', StupidRouterView);

class Router {
	routerView = new StupidRouterView();
	routes = {
		...defaultRoutes,
		...routes,
	};

	constructor() {
		console.log(location.pathname);
		console.log('router routes', this.routes);

		const route = location.pathname;

		console.log('router:', route)

		document.querySelector('body').appendChild(this.routerView);

		if (this.routes[route]) {
			console.log('i know that route');
		} else if (!/errors/.test(route)) {
			console.log('i dunno that route (goto 404)');
			const newRoute = '/errors/404';
			history.pushState({ oldRoute: route }, 'Not Found' , newRoute);
			this.routeChange(newRoute, route);
		} else {
			console.log('invalid error route')
		}

		this.updateRoute();
	}

	routeChange(newRoute, oldRoute) {
		console.log('new route:', this.routes[newRoute]);
	}

	updateRoute() {
		console.log('updateRouteView');
		const route = this.routes[location.pathname]
		this.routerView.loadRoute(route);
	}
}

const router = new Router();
