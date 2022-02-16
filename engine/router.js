import { route as engineRootRoute } from './routes.js';
import { route as projectRootRoute } from '../routes.js';
import { setupStupidComponentAutoloader } from './component-loader.js';
import { StupidBaseRouteView } from './components/stupid-base-route-view.js';

export class StupidRouterView extends HTMLElement {
	constructor(router) {
		super();
		this.innerHTML = '<p>Loading...</p>';
		this.router = router;
		this.hijackAnchorClicks();
	}

	hijackAnchorClicks() {
		// this.addEventListener('click', (event) => {
		// 	const nodeName = event.target.nodeName.toLowerCase();
		// 	const routeName = event.target.getAttribute('href');
		// 	const route = this.router.routes[routeName];
		// 	if (nodeName === 'a' && route) {
		// 		event.stopPropagation();
		// 		event.preventDefault();
		// 		this.router.changeRoute(routeName);
		// 	}
		// });
	}

	async loadRoute(context) {
		if (!context) throw new Error('Cannot load empty route');
		if (!context.name) throw new Error('Cannot load unnamed route');
		this.innerHTML = '';
		await setupStupidComponentAutoloader(context, this.router, StupidBaseRouteView);
		const routeView = document.createElement(context.name);
		const { controller } = routeView;
		const beforeRouteEnter = await controller.beforeRouteEnter();
		if (beforeRouteEnter === true) {
			this.appendChild(routeView);
		} else if (beforeRouteEnter) {
			this.innerHTML = `<p>That route says ${JSON.stringify(beforeRouteEnter)}</p>`;
			const response = router.changeRoute(beforeRouteEnter);
			console.log({ response });
		} else {
			this.innerHTML = '<p>That route says it shouldn\'t be loaded.</p>';
		}
	}
}

customElements.define('stupid-router-view', StupidRouterView);

class EngineRouter {
	routerView = new StupidRouterView(this);
	// routes = {
	// 	...engineRoutes,
	// 	...projectRoutes,
	// };

	constructor() {
		const routePath = location.pathname;

		document.querySelector('body').appendChild(this.routerView);

		// const route = this.findRoute(routePath);

		const route = this.updateRoute();

		if (route) {
		} else if (/errors/.test(routePath)) {
			console.log('invalid error route');
		} else {
			console.log('i dunno that route (goto 404)');
			this.changeRoute('/errors/404');
		}

		window.addEventListener('popstate', () => {
			this.updateRoute();
		});
	}

	changeRoute(newRoute) {
		const oldRoute = location.pathname;
		history.pushState({ oldRoute }, 'Loading...', newRoute);
		this.updateRoute();
	}

	updateRoute() {
		console.log('updateRoute()', location.pathname);

		const route = this.findRoute(location.pathname);
		if (!route) {
			console.warn('no route for', location.pathname);
			return null;
		}

		console.log({ route });
		// this.routes[location.pathname];
		this.routerView.loadRoute(route);
		return route;
	}

	findRoute(pathname) {
		const projectRoute = pathname === '/'
			? projectRootRoute
			: pathname
				.split('/')
				.slice(1)
				.reduce((result, name) => {
					return result && result.routes[name];
				}, projectRootRoute);
		console.log({
			x: [
				pathname,
				pathname.split('/'),
				pathname.split('/').slice(1),
			],
			projectRootRoute,
			projectRoute,
		});
		return projectRoute || pathname.split('/')
			.slice(1)
			.reduce((result, name) => {
				return result && result.routes[name];
			}, engineRootRoute) || null;
	}
}

export const router = new EngineRouter();
