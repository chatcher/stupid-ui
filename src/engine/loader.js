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

	async loadComponentTemplate(component) {
		console.log('Loader::loadcomponentTemplate()', { component });
		if (!this.promises[component.name]) {
			this.promises[component.name] = new Promise(async (resolve, reject) => {
				if (component.template) {
					const templateResponse = await fetch(component.template);
					if (templateResponse.ok) {
						const template = document.createElement('template');
						template.setAttribute('id', `${component.name}-template`);
						template.innerHTML = await templateResponse.text();
						document.querySelector('body').appendChild(template);
					} else {
						console.error('template', { templateResponse });
					}
				}

				const controller = component.controller ? await import (component.controller) : null;

				console.log({ controller });

				customElements.define(
					component.name,
					stupidTemplateComponent(component, controller),
				);

				resolve();
			});
		}

		return this.promises[component.name];
	}

	async loadRouteTemplate(route) {
		console.log('Loader::loadRouteTemplate()', { route });
		if (!route) throw new Error('loadRouteTemplate() no route');
		if (!this.promises[route.name]) {
			this.promises[route.name] = new Promise(async (resolve, reject) => {
				if (route.template) {
					const templateResponse = await fetch(route.template);
					if (templateResponse.ok) {
						const template = document.createElement('template');
						template.setAttribute('id', `${route.name}-template`);
						template.innerHTML = await templateResponse.text();
						document.querySelector('body').appendChild(template);
					} else {
						console.error('template', { templateResponse });
					}
				}

				const controller = route.controller ? await import(route.controller) : null;

				console.log({ controller });

				customElements.define(
					route.name,
					stupidTemplateComponent(route, controller),
				);

				resolve();
			});
		}

		return this.promises[route.name];
	}
}

export const loader = new Loader(components);
