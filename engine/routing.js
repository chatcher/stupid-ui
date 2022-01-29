import { routes as engineRoutes } from './routes.js';
import { routes as projectRoutes } from '../routes.js';
import { loader } from './loader.js';

console.log('client-side routing', { engineRoutes, projectRoutes });

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
		await loader.loadRouteTemplate(route);
		this.innerHTML = `<${route.name} />`;
	}
}

customElements.define('stupid-router-view', StupidRouterView);

class Router {
	routerView = new StupidRouterView();
	routes = {
		...engineRoutes,
		...projectRoutes,
	};

	constructor() {
		console.log('Router::constructor()', {
			'this.routes': this.routes,
			'location.pathname': location.pathname,
		});

		const routePath = location.pathname;

		document.querySelector('body').appendChild(this.routerView);

		if (this.routes[routePath]) {
			console.log('i know that route');
		} else if (!/errors/.test(routePath)) {
			console.log('i dunno that route (goto 404)');
			const newRoute = '/errors/404';
			history.pushState({ oldRoute: routePath }, 'Not Found' , newRoute);
			this.routeChange(newRoute, routePath);
		} else {
			console.log('invalid error route');
		}

		this.updateRoute();
	}

	routeChange(newRoute, oldRoute) {
		console.log('new route:', this.routes[newRoute]);
	}

	updateRoute() {
		console.log('updateRouteView');
		const route = this.routes[location.pathname];
		this.routerView.loadRoute(route);
	}
}

export const router = new Router();
