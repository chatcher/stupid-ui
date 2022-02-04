import { routes as engineRoutes } from './routes.js';
import { routes as projectRoutes } from '../routes.js';
import { setupStupidComponentAutoloader } from './component-loader.js'

export class StupidRouterView extends HTMLElement {
	constructor(router) {
		super();
		this.innerHTML = `<p>Loading...</p>`;
		this.router = router;
		this.hijackAnchorClicks();
	}

	hijackAnchorClicks() {
		this.addEventListener('click', (event) => {
			const nodeName = event.target.nodeName.toLowerCase();
			const routeName = event.target.getAttribute('href');
			const route = this.router.routes[routeName];
			if (nodeName === 'a' && route) {
				event.stopPropagation();
				event.preventDefault();
				this.router.changeRoute(routeName);
			}
		});
	}

	async loadRoute(context) {
		if (!context) throw new Error('Cannot load empty route');
		if (!context.name) throw new Error('Cannot load unnamed route');
		this.innerHTML = `<${context.name} />`;
		return setupStupidComponentAutoloader(context, this.router);
	}
}

customElements.define('stupid-router-view', StupidRouterView);

class EngineRouter {
	routerView = new StupidRouterView(this);
	routes = {
		...engineRoutes,
		...projectRoutes,
	};

	constructor() {
		const routePath = location.pathname;

		document.querySelector('body').appendChild(this.routerView);

		if (this.routes[routePath]) {
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
		const route = this.routes[location.pathname];
		this.routerView.loadRoute(route);
	}
}

export const router = new EngineRouter();
