import { routes as engineRoutes } from './routes.js';
import { routes as projectRoutes } from '../routes.js';
import { setupStupidComponentAutoloader } from './components.js'

export class StupidRouterView extends HTMLElement {
	constructor(router) {
		super();
		console.log('StupidRouterView::constructor()', { router });
		this.innerHTML = `<p>Loading...</p>`;
		this.router = router;
	}

	async loadRoute(context) {
		console.log({ context });
		if (!context) throw new Error('Cannot load empty route');
		if (!context.name) throw new Error('Cannot load unnamed route');
		this.innerHTML = `<${context.name} />`;
		return setupStupidComponentAutoloader(context, this.router);
	}
}

customElements.define('stupid-router-view', StupidRouterView);

class Router {
	routerView = new StupidRouterView(this);
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
			this.updateRoute();
		} else if (!/errors/.test(routePath)) {
			console.log('i dunno that route (goto 404)');
			this.changeRoute('/errors/404');
		} else {
			console.log('invalid error route');
		}

		window.addEventListener('popstate', (event) => {
			this.updateRoute();
		});
	}

	changeRoute(newRoute) {
		const oldRoute = location.pathname;
		history.pushState({ oldRoute: oldRoute }, 'Loading...' , newRoute);
		this.updateRoute();
	}

	updateRoute() {
		console.log('updateRouteView');
		const route = this.routes[location.pathname];
		this.routerView.loadRoute(route);
	}
}

export const router = new Router();
