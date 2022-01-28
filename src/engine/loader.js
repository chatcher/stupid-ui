import { components } from '../components.js';

console.log({ components });

const stupidTemplateComponent = (route, controllerModule) => {
	const {
		name: componentName,
	} = route;

	const controllerName = `${componentName.replace(
		/(?:\b|\W)(\w)/g,
		(_, letter) => letter.toUpperCase()
	)}Controller`;
	const Controller = controllerModule ? controllerModule[controllerName] : null;

	return class StupidComponent extends HTMLElement {
		constructor() {
			super();
			console.log('StupidComponent::constructor()', componentName);
			this.innerHTML = document
				.getElementById(`${componentName}-template`)
				.innerHTML;
			const anchors = this.querySelectorAll('a');
			console.log(`StupidComponent<${componentName}>::constructor()`, { anchors });
			const routerView = document.querySelector('stupid-router-view');
			console.log({ routerView }, routerView.loadRoute);

			if (Controller) {
				this.controller = new Controller(this);
			}
		}

		connectedCallback() {
			console.log('StupidComponent::connected()');
		}

		disconnectedCallback() {
			console.log('StupidComponent::disconnected()');
		}

		attributeChangedCallback(name, oldValue, newValue) {
			console.log('StupidComponent::update()', name, oldValue, newValue);
		}

		adoptedCallback() {
			console.log('StupidComponent::adopted()');
		}
	};
};

class Loader {
	promises = {};

	constructor(components) {
		Object.values(components).forEach((component) => {
			this.loadComponentTemplate(component);
		});
	}

	async loadTemplate(context) {
		console.log('Loader::loadTemplate()', { context });

		if (!this.promises[context.name]) {
			this.promises[context.name] = new Promise(async (resolve, reject) => {
				if (context.template) {
					const templateResponse = await fetch(context.template);
					if (templateResponse.ok) {
						const template = document.createElement('template');
						template.setAttribute('id', `${context.name}-template`);
						template.innerHTML = await templateResponse.text();
						document.querySelector('body').appendChild(template);
					} else {
						console.error('template', { templateResponse });
					}
				}

				const controller = context.controller ? await import (context.controller) : null;

				console.log({ controller });

				customElements.define(
					context.name,
					stupidTemplateComponent(context, controller),
				);

				resolve();
			});
		}

		return this.promises[context.name];
	}

	loadComponentTemplate(component) {
		return this.loadTemplate(component);
	}

	loadRouteTemplate(route) {
		return this.loadTemplate(route);
	}
}

export const loader = new Loader(components);
