import { StupidBaseComponent } from './components/stupid-base-component.js';

// export class CustomComponent extends HTMLElement {
// 	constructor() {
// 		super();
// 	}
// 	connectedCallback() {}
// 	disconnectedCallback() {}
// 	attributeChangedCallback(name, oldValue, newValue) {}
// 	adoptedCallback() {}
// }

import {
	loadTemplate,
	loadController,
	connectHeirarchy,
	initializeTemplate,
} from './component-initialization.js';
import { services } from './services.js';

const componentCache = {};

let loadCount = 1;
let readyTimeout = null;
let readyPromise = null;

const readyState = {};
readyState.promise = new Promise((resolve) => {
	readyState.resolve = resolve;
});

export const markLoadingComplete = (name) => {
	loadCount--;
	if(loadCount === 0) {
		readyState.resolve();
	}

	return readyState.promise;
};

export const setupStupidComponent = async ({
	context,
	router,
	template,
	Controller,
}) => {
	class StupidComponent extends HTMLElement {
		childComponents = [];

		constructor() {
			super();

			// console.log(`StupidComponent<${context.name}>::constructor()`, { context });

			this.context = context;
			this.template = template;
			this.componentId = `${context.name}-${Math.random().toString(16).substr(2, 6)}`;
			this.controller = new Controller(this, router, services);
			this.slottedContent = this.innerHTML;
			this.innerHTML = '';
		}

		connectedCallback() {
			if (!this.initialized) setTimeout(() => {
				connectHeirarchy(this);
				initializeTemplate(this, this.controller.$template || this.template);
				if (this.controller && this.controller.onInit) {
					this.controller.onInit();
				}
			});

			this.initialized = true;
		}

		disconnectedCallback() {
			// console.warn(`StupidComponent<${context.name}>::disconnect()`);
		}
	}

	customElements.define(
		context.name,
		StupidComponent,
	);

	markLoadingComplete(context.name);
};

export const setupStupidComponentAutoloader = async (
	context,
	router,
	DefaultController = StupidBaseComponent,
	defaultTemplate,
) => {
	if (!componentCache[context.name]) {
		loadCount++;
		componentCache[context.name] = Promise.all([
			loadTemplate(context),
			loadController(context),
		]).then(([
			template,
			Controller,
		]) => {
			setupStupidComponent({
				context,
				template: template || defaultTemplate,
				router,
				Controller: Controller || DefaultController,
			});
		});
	}

	return componentCache[context.name];
};

export const setupStupidEngineRouterView = async (router, Controller) => {
	loadCount++;
	return setupStupidComponent({
		context: {
			name: 'stupid-router-view'
		},
		router,
		template: '<route-slot>stupid-router-view template i guess</route-slot>',
		Controller,
	});
};
