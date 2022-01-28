
const stupidTemplateComponent = (componentName, Controller) =>
	class StupidComponent extends HTMLElement {
		constructor() {
			super();
			console.log('StupidComponent::constructor()', componentName);
			this.innerHTML = document
				.getElementById(componentName)
				.innerHTML;
			const anchors = this.querySelectorAll('a');
			console.log(`StupidComponent<${componentName}>::constructor()`, { anchors });
			const routerView = document.querySelector('stupid-router-view');
			console.log({ routerView }, routerView.loadRoute);

			if (Controller) {
				this.controller = new Controller();
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

class Loader {
	promises = {};

	async loadRouteTemplate(route) {
		if (!route) throw new Error('loadRouteTemplate() no route');
		if (!this.promises[route.name]) {
			this.promises[route.name] = new Promise(async (resolve, reject) => {
				console.log('Loader::loadRouteTemplate()', { route });

				if (route.template) {
					const templateResponse = await fetch(route.template);
					if (templateResponse.ok) {
						const template = document.createElement('template');
						template.setAttribute('id', route.name);
						template.innerHTML = await templateResponse.text();
						document.querySelector('body').appendChild(template);
					} else {
						console.log('template', { templateResponse });
					}
				}

				const controller = route.controller ? await import(route.controller) : null;

				console.log({ controller });

				customElements.define(
					route.name,
					stupidTemplateComponent(route.name, controller),
				);

				resolve();
			});
		}

		return this.promises[route.name];
	}
}

export const loader = new Loader();
