import { route as engineRootRoute } from './routes.js';
import { route as projectRootRoute } from '../routes.js';
import { StupidBaseComponent } from './components/stupid-base-component.js';
import {
	setupStupidComponentAutoloader,
	setupStupidEngineRouterView,
} from './component-loader.js';
import { StupidBaseRouteView } from './routes/stupid-base-route-view.js';

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
		console.log('StupidRouterViewController::constructor()');
		// console.log(element);
		// console.log(router);
		// console.log(services);
		// console.log('stupid router view controller $emit', this.$emit);
		// console.groupEnd();
		// this.$emit('stupid-route-created', this);
		// this.innerHTML = '<p>Loading...</p>';
	// 	this.router = router;
		this.hijackAnchorClicks();
	}

	hijackAnchorClicks() {
		document.addEventListener('click', (event) => {
			const nodeName = event.target.nodeName.toLowerCase();
			if (nodeName !== 'a') {
				return;
			}
			const routeName = event.target.getAttribute('href');
			const isRoute = this.$router.isRoute(routeName);
			if (isRoute) {
				event.stopPropagation();
				event.preventDefault();
				this.$router.changeRoute(routeName);
			}
		});
	}

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
	routerView = null;
	routerPath = [];
	routerStack = [];

	constructor() {
		console.log('StupidEngineRouter::constructor()');

		document.addEventListener('stupid-route-attached', (event) => {
			console.warn('stupid route attached');
			// console.log(event);

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
			setTimeout(() => this.updateRoute());
		})

		// setTimeout(() => this.changeRoute(location.pathname));

		document.addEventListener('stupid-engine-ready', async (event) => {
			console.warn('stupid engine router', 'stupid-engine-ready', event)
		// // 	// await this.changeRoute(location.pathname);
		// // 	console.log('slots now', document.querySelectorAll('route-slot'));
		// 	// setTimeout(() => this.changeRoute(location.pathname));
		// 	// this.init();
		});

		// window.addEventListener('load', () => {
		// 	console.warn('window load');
		// 	// this.changeRoute(location.pathname)
		// 	// setTimeout(() => this.changeRoute(location.pathname));
		// });

		window.addEventListener('popstate', () => {
			// this.updateRoute();
			setTimeout(() => this.changeRoute(location.pathname));
		});
	}

	async init() {
		console.group('StupidEngineRouter::init()');

		this.routerView = document.createElement('root-view');
		// this.routerView = document.createElement('stupid-router-view');
		document.querySelector('body').appendChild(this.routerView);

		// if (route) {
		// } else if (/errors/.test(routePath)) {
		// 	console.log('invalid error route');
		// } else {
		// 	console.log('i dunno that route (goto 404)');
		// 	this.changeRoute('/errors/404');
		// }

		console.groupEnd();

		setTimeout(() => this.changeRoute(location.pathname));
	}

	async changeRoute(newRoute) {
		console.group('change route');
		console.log('new route', newRoute);
		console.log('router stack', this.routerStack);
		console.log('router path (before)', this.routerPath);

		const parts = newRoute === '/' ? [] : newRoute.split('/').slice(1);
		console.log('parts:', parts);

		this.routerStack.length = 0;
		for (let index = parts.length; index < this.routerPath.length; index++) {
			console.log({ detach: this.routerPath[index] });
			if (this.routerPath[index]) {
				this.routerPath[index].element.controller.$detach();
			}
			this.routerPath[index] = null;
		}

		console.log('router path (after)', this.routerPath);

		let route = projectRootRoute;

		for (const [index, name] of parts.entries()) {
			route = route.routes[name];

			if (!route) {
				console.error('Missing route', name, this.routerPath[index]);
			  if (this.routerPath[index]) {
					this.routerPath[index].element.controller.$detach();
				}
				this.routerPath[index] = null
				continue;
			}

			console.log('routePath at', index, 'should be', name, 'but currently', this.routerPath[index]);

			if (!this.routerPath[index]) {
				console.log('empty entry at', index);
				console.warn('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else if (this.routerPath[index].name !== name) {
				console.log('name change', this.routerPath[index]);
				console.log({ discard: this.routerPath[index] });
				console.warn('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index].element.controller.$detach();
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else if (this.routerStack.length) {
				console.log('stack exists', this.routerPath[index]);
				console.log({ discard: this.routerPath[index] });
				console.warn('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index].element.controller.$detach();
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else {
				console.group('no change at slot', index);
				console.log({ entry: this.routerPath[index] });
				console.log({ element: this.routerPath[index].element });
			}
		}

		console.groupEnd();

		// this.triggerRouteView();

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

		const oldRoute = location.pathname;
		history.pushState({ oldRoute }, 'Loading...', newRoute);
		this.updateRoute();
	}

	async updateRoute() {
		console.group('updateRoute()');
		console.log('router path', this.routerPath);
		console.log('router stack', this.routerStack);
		console.log();

		const nextRouteView = this.routerStack.shift();
		console.log({nextRouteView});
		if (nextRouteView) {
			const element = nextRouteView.element;
			console.log({ element });
			const controller = nextRouteView.element.controller;
			console.log({ controller });
			if (controller) {
				console.log('controller', controller);
				const beforeRouteEnter = await controller.beforeRouteEnter();
				console.log({ beforeRouteEnter });
				const something = controller.$attach();
				console.log('something', { something });
			} else {
				console.error('No controller for', element);
			}
		} else {
			console.log('no additional route views');
		}
		console.groupEnd();

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
		return pathname === '/'
			? projectRootRoute
			: pathname
				.split('/')
				.slice(1)
				.reduce((result, name) => {
					return result && result.routes[name];
				}, projectRootRoute);
	}

	isRoute(pathname) {
		return !!this.findRoute(pathname);
	}
}

export const router = new StupidEngineRouter();

setupStupidEngineRouterView(
	router,
	StupidRouterViewController,
);
