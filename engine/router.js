import { route as engineRootRoute } from './routes.js';
import { route as projectRootRoute } from '../routes.js';
import { StupidBaseComponent } from './components/stupid-base-component.js';
import {
	setupStupidComponentAutoloader,
	setupStupidEngineRouterView,
} from './component-loader.js';
import { populateTemplate } from './component-initialization.js';
import { StupidBaseRouteView } from './routes/stupid-base-route-view.js';

export class StupidRouterViewController extends StupidBaseRouteView {
	get isAttached() {
		return !!this.$element.parentElement;
	}

	onInit() {
	}

	constructor(element, router, services) {
		super(element, router, services);
		// console.log('StupidRouterViewController::constructor()');
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
}

class StupidEngineRouter {
	routerView = null;
	routerPath = [];
	routerStack = [];

	constructor() {
		// console.log('StupidEngineRouter::constructor()');

		document.addEventListener('stupid-route-attached', (event) => {
			setTimeout(() => this.updateRoute());
		});

		document.addEventListener('stupid-engine-ready', async (event) => {
			console.log('stupid engine router', 'stupid-engine-ready')
		});

		window.addEventListener('popstate', () => {
			setTimeout(() => this.changeRoute(location.pathname));
		});
	}

	async init() {
		this.routerView = document.createElement('stupid-router-view');
		document.querySelector('body').appendChild(this.routerView);

		setTimeout(() => this.changeRoute(location.pathname));
		setTimeout(() => this.updateRoute());
	}

	async changeRoute(newRoute) {
		// console.groupCollapsed('change route');
		console.log('new route', newRoute);

		const parts = newRoute === '/' ? [] : newRoute.split('/').slice(1);
		parts.unshift('root');

		this.routerStack.length = 0;
		for (let index = this.routerPath.length - 1; index >= parts.length; index--) {
			const entry = this.routerPath[index];
			this.routerPath[index] = null;
			console.log({ detach: entry, index });
			if (entry) {
				entry.element.controller.$detach();
			}
		}

		console.groupCollapsed('initial path & stack');
		console.log('path', this.routerPath);
		console.log('stack', this.routerStack);
		console.groupEnd();

		let route = projectRootRoute;

		for (const [index, name] of parts.entries()) {
			route = name === 'root' ? projectRootRoute : route.routes[name];

			if (!route) {
				console.error('Missing route', name, this.routerPath[index]);
			  if (this.routerPath[index]) {
					this.routerPath[index].element.controller.$detach();
				}
				this.routerPath[index] = null
				continue;
			}

			if (!this.routerPath[index]) {
				// console.log('empty path slot', index);
				// console.warn('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else if (this.routerPath[index].name !== name) {
				// console.log('name change', this.routerPath[index]);
				// console.log({ discard: this.routerPath[index] });
				// console.warn('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index].element.controller.$detach();
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else if (this.routerStack.length) {
				// console.log('stack exists', this.routerPath[index]);
				// console.log({ discard: this.routerPath[index] });
				// console.warn('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index].element.controller.$detach();
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			} else {
				// console.log('no change at slot', index);
				// console.log({ entry: this.routerPath[index] });
				// console.log({ element: this.routerPath[index].element });
				this.routerPath[index].skipAttach = true;
				this.routerStack.push(this.routerPath[index]);
				setTimeout(() => this.updateRoute());
			}
		}

		console.groupCollapsed('final path & stack');
		console.log({ routerPath: this.routerPath });
		console.log({ routerStack: this.routerStack });
		console.groupEnd();

		const oldRoute = location.pathname;
		history.pushState({ oldRoute }, 'Loading...', newRoute);

		// console.groupEnd();
	}

	async updateRoute() {
		// console.groupCollapsed('updateRoute()');
		const nextRouteView = this.routerStack.shift();
		if (nextRouteView) {
			const element = nextRouteView.element;
			const controller = nextRouteView.element.controller;
			if (controller) {
				// console.log('controller', controller);
				const beforeRouteEnter = await controller.beforeRouteEnter();
				// console.log({ beforeRouteEnter, match: beforeRouteEnter === location.pathname });
				if (beforeRouteEnter === true || beforeRouteEnter === location.pathname) {
					if (nextRouteView.skipAttach) {
						populateTemplate(element);
					} else {
						controller.$attach();
					}
					// setTimeout(() => this.updateRoute());
				} else {
					// console.groupEnd();
					console.warn('should re-route');
					console.log('path', this.routerPath);
					console.log('stack', this.routerStack);
					console.log(this.routerPath.includes(nextRouteView));
					const index = this.routerPath.indexOf(nextRouteView);
					this.routerPath[index] = nextRouteView.skipAttach ? this.routerPath[index] : null;
					// this.routerStack.length = 0;
					await this.changeRoute(beforeRouteEnter);
					// await this.updateRoute();
					setTimeout(() => this.updateRoute());
					return;
				}
			} else {
				console.error('No controller for', element);
			}
		} else {
			console.groupCollapsed('no additional route views');
			console.log('path', this.routerPath);
			console.log('stack', this.routerStack);
			console.groupEnd();
		}
		// console.groupEnd();
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
