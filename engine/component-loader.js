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

export const setupStupidComponentAutoloader = async (context, router, DefaultController = StupidBaseComponent) => {
	if (!componentCache[context.name]) {
		componentCache[context.name] = Promise.all([
			loadTemplate(context),
			loadController(context),
		]).then(([
			template,
			Controller,
		]) => {
			class StupidComponent extends HTMLElement {
				children = [];

				constructor() {
					super();

					console.debug(`StupidComponent<${context.name}>::constructor()`, { context });

					this.context = context;
					this.template = template;
					this.componentId = `${context.name}-${Math.random().toString(16).substr(2, 6)}`;
					this.controller = Controller ? new Controller(this, router, services) : new DefaultController(this, router, services);
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
		});
	}

	return componentCache[context.name];
};
