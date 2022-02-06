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
	connectHeirarchy,
	initializeTemplate,
} from './component-initialization.js';

const loadTemplate = async (context) => {
	if (!context.template) {
		console.info(`No template declared for ${context.name}.`);
		return null;
	}

	const templateResponse = await fetch(context.template);

	if (!templateResponse.ok) {
		console.error(`Error loading ${context.name} template.`)
		console.warn(templateResponse);
		return null;
	}

	return templateResponse.text();
};

const loadController = async (context) => {
	if (!context.controller) {
		console.info(`No controller declared for ${context.name}.`);
		return null;
	}

	try {
		const controllerModule = await import(context.controller);
		const controllerClassName = `${context.name.replace(
			/(?:\b|\W)(\w)/g,
			(_, letter) => letter.toUpperCase()
		)}Controller`;

		if (!controllerModule) {
			console.error(`Empty ${context.name} module.`);
			return null;
		}

		if (!controllerModule[controllerClassName]) {
			console.warn(`No controller exported from ${context.name} module.`);
			return null;
		}

		return controllerModule[controllerClassName]
	} catch (error) {
		console.error(`Error loading ${context.name} module.`);
		console.warn(error);
		return null;
	}
};

const componentCache = {};

export const setupStupidComponentAutoloader = async (context, router) => {
	if (!componentCache[context.name]) {
		componentCache[context.name] = Promise.all([
			loadTemplate(context),
			loadController(context),
		]).then(([
			template,
			Controller,
		]) => {
			const closure = {
				context,
			};

			class StupidComponent extends HTMLElement {
				children = [];

				constructor() {
					super();

					console.debug(`StupidComponent<${context.name}>::constructor()`, { context });

					this.context = context;
					this.template = template;
					this.componentId = `${context.name}-${Math.random().toString(16).substr(2, 6)}`;
					this.controller = Controller ? new Controller(this) : {};
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
					console.warn(`StupidComponent<${context.name}>::disconnect()`);
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
