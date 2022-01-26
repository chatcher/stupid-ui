
const stupidTemplateComponent = (templateId) =>
	class StupidComponent extends HTMLElement {
		constructor() {
			super();
			console.log('StupidComponent::constructor()', templateId);
			this.innerText = 'Aye, Component!';
			if (templateId) {
	      this.innerHTML = document
	      	.getElementById(templateId)
	      	.innerHTML;
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

	async loadTemplate(route) {
		if (!route) throw new Error('loadTemplate() no route');
		if (!this.promises[route.name]) {
			this.promises[route.name] = new Promise(async (resolve, reject) => {
				console.log('Loader::loadTemplate()', { route });
				const response = await fetch(route.file);
				console.log({ response });

				if (!response.ok) {
					return reject(response.statusText);
				}

				const template = await response.text();

				const element = document.createElement('template');
				element.setAttribute('id', route.name);
				element.innerHTML = template;
				document.querySelector('body').appendChild(element);

				customElements.define(
					route.name,
					stupidTemplateComponent(route.name),
				);

				resolve(response.statusText);
			});
		}

		return this.promises[route.name];
	}
}

export const loader = new Loader();
