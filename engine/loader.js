import { components } from '../components.js';
import { stupidTemplateComponent, setupStupidComponentAutoloader } from './components.js'

console.log({ components });

class Loader {
	promises = {};

	constructor(components) {
		Object.values(components).forEach((component) => {
			setupStupidComponentAutoloader(component);
		});
	}

	loadRouteTemplate(context) {
		console.log('Loader::loadRouteTemplate()', { context });

		if (!this.promises[context.name]) {
			this.promises[context.name] = (async () => {
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

				const controller = context.controller ? await import(context.controller) : null;

				console.log({ controller });

				customElements.define(
					context.name,
					stupidTemplateComponent(context, controller),
				);
			})();
		}

		return this.promises[context.name];
	}
}

export const loader = new Loader(components);
