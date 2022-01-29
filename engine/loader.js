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

const setupStupidComponentAutoloader = (context) => {
	class StupidComponentAutoloader extends HTMLElement {
		context = context;
		module = null;

		get controllerClassName() {
			const {
				name: componentName,
			} = this.context;

			return `${componentName.replace(
				/(?:\b|\W)(\w)/g,
				(_, letter) => letter.toUpperCase()
			)}Controller`;
		}

		get Controller() {
			return this.module[this.controllerClassName];
		}

		constructor() {
			super();
			console.log('StupidComponentAutoloader::constructor()', { context });
			this.innerHTML = `<p>Loading ${context.name}...</p>`;
			this.awesome();
		}

		async awesome() {
			if (context.template) {
				const templateResponse = await fetch(context.template);
				if (templateResponse.ok) {
					this.innerHTML = await templateResponse.text();
				} else {
					this.innerHTML = `<pre>Error: ${
						JSON.stringify(templateResponse, null, 2)
							.replace(/[<>&"']/g, (ch) => ({
								'<': '&lt;',
								'>': '&gt;',
								'&': '&amp;',
								'"': '&quot;',
								'\'': '&apos;',
							}[ch]))}</pre>`;
					console.error('fetch template', { context, templateResponse });
				}
			}

			if (context.controller) {
				this.module = await import(context.controller);
				this.controller = new this.Controller(this);
			}
		}
	}

	customElements.define(
		context.name,
		StupidComponentAutoloader,
	);
};

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
			this.promises[context.name] = new Promise(async (resolve) => {
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

				resolve();
			});
		}

		return this.promises[context.name];
	}
}

export const loader = new Loader(components);
