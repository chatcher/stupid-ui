import { route as engineRootRoute } from './routes.js';
import { route as projectRootRoute } from '../routes.js';
import { StupidBaseComponent } from './components/stupid-base-component.js';
import {
	setupStupidComponentAutoloader,
	setupStupidEngineRouterView,
} from './component-loader.js';
import { populateTemplate } from './component-initialization.js';
import { StupidBaseRouteView } from './routes/stupid-base-route-view.js';

const baseRoute = mergeRoutes();

const log = {
	route: (...args) => console.log('routing:', ...args),
}

function mergeRoutes() {
	const routes = {
		...projectRootRoute,
	};
	recursiveMergeRoutes(routes, engineRootRoute);
	return routes;
}

function recursiveMergeRoutes(base, subject) {
	Object.assign(base.routes, subject.routes, base.routes);
	// TODO: handle overlapping routes between engine and project.
}

export class StupidRouterViewController extends StupidBaseRouteView {
	get isAttached() {
		return !!this.$element.parentElement;
	}

	onInit() {
	}
}

class StupidEngineRouter {
	routerView = null;
	routerPath = [];
	routerStack = [];

	constructor() {
		// console.log('StupidEngineRouter::constructor()');
		this.hijackAnchorClicks();

		document.addEventListener('stupid-route-attached', (event) => {
			log.route('stupid-route-attached');
			// log.route('scheduling update route from route attached')
			// setTimeout(() => this.updateRoute());
		});

		document.addEventListener('stupid-engine-ready', async (event) => {
			console.log('stupid engine router', 'stupid-engine-ready')
		});

		window.addEventListener('popstate', (event) => {
			console.warn('history pop', event);
			setTimeout(() => this.changeRoute(location.pathname));
		});
	}

	hijackAnchorClicks() {
		document.addEventListener('click', (event) => {
			const nodeName = event.target.nodeName.toLowerCase();
			if (nodeName !== 'a') {
				return;
			}
			const routeName = event.target.getAttribute('href');
			const isRoute = this.isRoute(routeName);
			if (isRoute) {
				event.stopPropagation();
				event.preventDefault();
				this.changeRoute(routeName);
			}
		});
	}

	async init() {
		this.routerView = document.createElement('stupid-router-view');
		document.querySelector('body').appendChild(this.routerView);

		setTimeout(() => this.changeRoute(location.pathname));
		// log.route('scheduling update route from init');
		// setTimeout(() => this.updateRoute());
	}

	async changeRoute(newRoute) {
		log.route('new route', newRoute);

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

		log.route('initial path & stack');
		log.route('path', this.routerPath);
		log.route('stack', this.routerStack);

		let route = baseRoute;
		let forceReattach = false;

		for (const [index, name] of parts.entries()) {
			route = name === 'root' ? baseRoute : route.routes[name];

			if (!route) {
				console.error('Missing route', { name }, this.routerPath[index]);
				if (this.routerPath[index]) {
					this.routerPath[index].element.controller.$detach();
				}
				this.routerPath[index] = null;
				setTimeout(() => location.replace('/errors/404'))
				continue;
			}

			if (!this.routerPath[index]) {
				log.route('empty path slot', index);
				log.route('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
				forceReattach = true;
			} else if (this.routerPath[index].name !== name) {
				log.route('name change in slot', index, this.routerPath[index]);
				log.route({ discard: this.routerPath[index] });
				log.route('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index].element.controller.$detach();
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
				forceReattach = true;
			} else if (forceReattach) {
				log.route('force reattach in slot', index);
				log.route({ discard: this.routerPath[index] });
				log.route('create element', route.name);
				const element = document.createElement(route.name);
				const entry = { name, element };
				this.routerPath[index].element.controller.$detach();
				this.routerPath[index] = entry;
				this.routerStack.push(entry);
			// } else if (this.routerStack.length) {
			// 	log.route('stack exists for slot', index, this.routerPath[index]);
			// 	log.route('but we do nothing');
			} else {
				log.route('no change at slot', index);
				log.route({ entry: this.routerPath[index] });
				log.route({ element: this.routerPath[index].element });
				this.routerPath[index].skipAttach = true;
				this.routerStack.push(this.routerPath[index]);
				// log.route('scheduling update route from static route')
				// setTimeout(() => this.updateRoute());
			}
		}

		log.route('final path & stack');
		log.route({ routerPath: this.routerPath });
		log.route({ routerStack: this.routerStack });

		const oldRoute = location.pathname;
		history.pushState({ oldRoute }, 'Loading...', newRoute);
		log.route('scheduling update route from changeRoute')
		setTimeout(() => this.updateRoute());
	}

	async updateRoute() {
		log.route('updateRoute()', this.routerStack.length);
		const nextRouteView = this.routerStack.shift();
		if (nextRouteView) {
			const element = nextRouteView.element;
			const controller = nextRouteView.element.controller;
			if (controller) {
				// console.log('controller', controller);
				const beforeRouteEnter = await controller.beforeRouteEnter();
				log.route({ beforeRouteEnter, match: beforeRouteEnter === location.pathname });
				if (beforeRouteEnter === true || beforeRouteEnter === location.pathname) {
					if (nextRouteView.skipAttach) {
						log.route('re-populating template');
						populateTemplate(element);
						// log.route('scheduling update route from re-population')
						// setTimeout(() => this.updateRoute());
					} else {
						log.route('attaching controller');
						controller.$attach();

					}
					log.route('scheduling update route from route attach or re-populate')
					setTimeout(() => this.updateRoute());
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
					// log.route('scheduling update route from re-routing');
					// setTimeout(() => this.updateRoute());
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
			? baseRoute
			: pathname
				.split('/')
				.slice(1)
				.reduce((result, name) => {
					return result && result.routes[name];
				}, baseRoute);
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
