import { route as engineRootRoute } from './routes.js';
import { route as projectRootRoute } from '../routes.js';
import { StupidBaseComponent } from './components/stupid-base-component.js';
import {
	setupStupidComponentAutoloader,
	setupStupidEngineRouterView,
} from './component-loader.js';
import { StupidBaseRouteView } from './components/stupid-base-route-view.js';

export class StupidRouterViewController extends StupidBaseRouteView {
	get isAttached() {
		return !!this.$element.parentElement;
	}

	onInit() {
		console.warn('StupidRouterViewController::onInit()');
		this.$emit('stupid-route-attached', this);
	}

	constructor(element, router, services) {
		super(element, router, services);
		console.group('StupidRouterViewController::constructor()');
		console.log(element);
		console.log(router);
		console.log(services);
		console.log('stupid router view controller $emit', this.$emit);
		console.groupEnd();
		// this.$emit('stupid-route-created', this);
		// this.innerHTML = '<p>Loading...</p>';
	// 	this.router = router;
	// 	this.hijackAnchorClicks();
	}

	// attach() {
	// 	console.log({ 'my element:': this.$element });
	// 	const routeSlot = document.querySelector('route-slot');
	// 	if (routeSlot) {
	// 		this.$routeSlot = routeSlot;
	// 		console.log('i found a route slot:', this.$routeSlot);
	// 		this.$routeSlot.replaceWith(this.$element);
	// 	} else {
	// 		console.error('could not find a route slot');
	// 	}
	// }

	// detach() {
	// 	this.$element.replaceWith(this.$routeSlot);
	// 	this.$routeSlot = null;
	// }

	// hijackAnchorClicks() {
	// 	this.addEventListener('click', (event) => {
	// 		const nodeName = event.target.nodeName.toLowerCase();
	// 		const routeName = event.target.getAttribute('href');
	// 		const route = this.router.routes[routeName];
	// 		if (nodeName === 'a' && route) {
	// 			event.stopPropagation();
	// 			event.preventDefault();
	// 			this.router.changeRoute(routeName);
	// 		}
	// 	});
	// }

	// async loadRoute(context) {
	// 	if (!context) throw new Error('Cannot load empty route');
	// 	if (!context.name) throw new Error('Cannot load unnamed route');
	// 	this.innerHTML = '';
	// 	await setupStupidComponentAutoloader(context, this.router, StupidBaseRouteView);
	// 	const routeView = document.createElement(context.name);
	// 	const { controller } = routeView;
	// 	const beforeRouteEnter = await controller.beforeRouteEnter();
	// 	if (beforeRouteEnter === true) {
	// 		this.appendChild(routeView);
	// 	} else if (beforeRouteEnter) {
	// 		this.innerHTML = `<p>That route says ${JSON.stringify(beforeRouteEnter)}</p>`;
	// 		const response = router.changeRoute(beforeRouteEnter);
	// 		console.log({ response });
	// 	} else {
	// 		this.innerHTML = '<p>That route says it shouldn\'t be loaded.</p>';
	// 	}
	// }
}

// customElements.define('stupid-router-view', StupidRouterView);

class StupidEngineRouter {
	routerView = document.createElement('root-view')

	routerPath = [];
	routerStack = [];

	constructor() {
		console.log('StupidEngineRouter::constructor()');
		// const routePath = location.pathname;

		document.querySelector('body').appendChild(this.routerView);

		console.log(this.routerView);
		console.log({ routerView: this.routerView });

		// const route = this.findRoute(routePath);

		// const route = this.updateRoute();

		// if (route) {
		// } else if (/errors/.test(routePath)) {
		// 	console.log('invalid error route');
		// } else {
		// 	console.log('i dunno that route (goto 404)');
		// 	this.changeRoute('/errors/404');
		// }

		document.addEventListener('stupid-route-attached', (event) => {
			console.warn('stupid route attached');
			console.log(event);

			// console.log('um, router path root', this.routerPath[0].element.controller.isAttached)
			// const nextRoute = this.routerPath.find((route) => {
			// 	console.log(route);
			// 	return !route.element.controller.isAttached;
			// 	// return false;
			// })
			// console.log('next route', nextRoute);
			// if (nextRoute) {
			// 	nextRoute.element.controller.attach();
			// }
			setTimeout(() => this.triggerRouteView());
		})

		// setTimeout(() => this.changeRoute(location.pathname));

		document.addEventListener('stupid-engine-ready', async (event) => {
			console.warn('stupid engine router', 'stupid-engine-ready', event)
		// 	// await this.changeRoute(location.pathname);
		// 	console.log('slots now', document.querySelectorAll('route-slot'));
			setTimeout(() => this.changeRoute(location.pathname));
		});

		window.addEventListener('load', () => {
			console.warn('window load');
			// this.changeRoute(location.pathname)
			// setTimeout(() => this.changeRoute(location.pathname));
		});

		window.addEventListener('popstate', () => {
			this.updateRoute();
		});
	}

	async triggerRouteView() {
		console.group('triggerRouteView()');
		const nextRouteView = this.routerPath.shift();
		console.log({nextRouteView});
		if (nextRouteView) {
			const element = nextRouteView.element;
			console.log({ element });
			const controller = nextRouteView.element.controller;
			console.log({ controller });
			if (controller) {
				const something = controller.attach();
				console.log('something', { something });
			} else {
				console.error('No controller for', element);
			}
		} else {
			console.log('no additional route views');
		}
		console.groupEnd();
	}

	async changeRoute(newRoute) {
		console.log('change route', newRoute);

		// console.log('engine routes', engineRootRoute);
		// console.log('project routes', projectRootRoute);
		const parts = newRoute.split('/').slice(1);
		console.log(parts);

		for (let index = parts.length; index < this.routerPath.length; index++) {
			this.routerPath[index].element.replaceWith(this.routerPath[index].slot);
			this.routerPath[index] = null;
		}

		let route = projectRootRoute;

		for (const [index, name] of parts.entries()) {
			route = route.routes[name];

			if (!route) {
				console.error('Missing route', name);
			}

			console.log(index, name);
			console.warn('create element', route.name);
			const element = document.createElement(route.name);
			const entry = { name, element };

			if (!this.routerPath[index]) {
				console.log('null');
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else if (this.routerPath[index].name !== name) {
				console.log('name');
				this.routerPath[index].element.replaceWith(this.routerPath[index].slot);
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else if (this.routerStack.length) {
				console.log('stack');
				this.routerPath[index].element.replaceWith(this.routerPath[index].slot);
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else {
				console.log('else');
			}
		}

		this.triggerRouteView();

		// const something = this.routerPath[0].element.controller.attach();
		// console.log({ 'top element': this.routerPath[0].element.controller.attach });

		// const routeParts = parts.map((name) => {
		// 	if (parentRoute && parentRoute.routes) {
		// 		const route = parentRoute.routes[name];
		// 		parentRoute = route;
		// 		return route;
		// 	}
		// 	return null;
		// });
		// console.log(routeParts);
		// console.log(this.routerPath);

		// const route = routeParts.find((route, index) => (
		// 	this.routerPath[index] !== route
		// ));
		// console.log({ route });

		// if (route) {
		// 	const element = document.createElement(route.name);
		// 	const slots = document.querySelectorAll('route-slot');
		// 	const slot = slots[0];

		// 	if (!slots.length) {
		// 		console.error('no route slot to plug', route.name, 'into');
		// 	} else if (slots.lenth > 1) {
		// 		console.error('too many route slots');
		// 	} else {
		// 		route.routeSlot = slot;
		// 		route.element = element;
		// 		slot.replaceWith(element);
		// 	}
		// }

		// const routeChange = routeParts.find((route) => {});

		// const nextRoute = parts.reduce((routeView, name, index) => {
		// 	if (routeView) return routeView;

		// 	const element = document.createElement(route.name);

		// 	if (!this.routerPath[index]) {
		// 		console.log('no stored route at', index);
		// 		this.routerPath[index] = {
		// 			name,
		// 			element,
		// 		};
		// 		console.log(parent);
		// 		console.log(route);
		// 		console.log(element);
		// 		// return null
		// 		return element;
		// 	} else if(this.routerPath[index].name) {
		// 		console.log('swap', index, this.routerPath[index].name, '->', name);
		// 		// this.routerPath[index].element.replaceWith(element);
		// 		this.routerPath[index] = {
		// 			name,
		// 			element,
		// 		};
		// 		return element
		// 	} else {
		// 		console.log('no change', index, name);
		// 	}

		// 	return routeView;
		// }, null);

		// console.log({ nextRoute });

		// const projectRoute = parts.reduce((parent, name, index) => {
		// 	const route = parent && parent.routes[name] || null;

		// 	if (!route) {
		// 		console.warn('no more route');
		// 		console.log(parent);
		// 		return null;
		// 	}

		// 	console.log('creating element', route.name, {parent});
		// 	const element = document.createElement(route.name);

		// 	const slots = Array.from(document.querySelectorAll('route-slot'));
		// 	console.log(slots);
		// 	if (!slots.length) {
		// 		console.error('No route slots found.');
		// 	}
		// 	if (slots.length > 1) {
		// 		console.error('Multiple route slots found.');
		// 	}

		// 	const slot = slots[0];

		// 	// const slot = parent.routerView;

		// 	if (!this.routerPath[index]) {
		// 		console.log('no stored route at', index);
		// 		this.routerPath[index] = {
		// 			name,
		// 			element,
		// 		};
		// 		slot.replaceWith(element);
		// 		console.log(parent);
		// 		console.log(route);
		// 		console.log(element);
		// 		return null
		// 	} else if(this.routerPath[index].name) {
		// 		console.log('swap', index, this.routerPath[index].name, '->', name);
		// 		this.routerPath[index].element.replaceWith(element);
		// 		this.routerPath[index] = {
		// 			name,
		// 			element,
		// 		};
		// 	} else {
		// 		console.log('no change', index, name);
		// 	}

		// 	console.log(name, route);
		// 	return route;
		// }, projectRootRoute);

		// const route = projectRootRoute;

		// const oldRoute = location.pathname;
		// history.pushState({ oldRoute }, 'Loading...', newRoute);
		// this.updateRoute();
	}

	updateRoute() {
		console.log('updateRoute()', location.pathname);

		// const route = this.findRoute(location.pathname);
		// if (!route) {
		// 	console.warn('no route for', location.pathname);
		// 	return null;
		// }

		// console.log({ route });
		// // this.routes[location.pathname];
		// this.routerView.loadRoute(route);
		// return route;
	}

	findRoute(pathname) {
		// const projectRoute = pathname === '/'
		// 	? projectRootRoute
		// 	: pathname
		// 		.split('/')
		// 		.slice(1)
		// 		.reduce((result, name) => {
		// 			return result && result.routes[name];
		// 		}, projectRootRoute);
		// console.log({
		// 	x: [
		// 		pathname,
		// 		pathname.split('/'),
		// 		pathname.split('/').slice(1),
		// 	],
		// 	projectRootRoute,
		// 	projectRoute,
		// });
		// return projectRoute || pathname.split('/')
		// 	.slice(1)
		// 	.reduce((result, name) => {
		// 		return result && result.routes[name];
		// 	}, engineRootRoute) || null;
	}
}

export const router = new StupidEngineRouter();

setupStupidEngineRouterView(
	router,
	StupidRouterViewController,
);
