import { routes as engineRoutes } from './routes.js';
import { routes as projectRoutes } from '../routes.js';
import { loader } from './loader.js';

console.log('client-side routing', { engineRoutes, projectRoutes });

export class StupidRouterView extends HTMLElement {
	constructor() {
		super();
		console.log('StupidRouterView::constructor()');
		this.innerHTML = `<p>Loading...</p>`;
	}

	async loadRoute(context) {
		console.log({ context });
		if (!context) throw new Error('Cannot load empty route');
		if (!context.name) throw new Error('Cannot load unnamed route');
		this.innerHTML = `<${context.name} />`;
		await loader.loadRouteTemplate(context);
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
