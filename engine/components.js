// export class CustomComponent extends HTMLElement {
// 	constructor() {
// 		super();
// 	}

// 	connectedCallback() {}

// 	disconnectedCallback() {}

// 	attributeChangedCallback(name, oldValue, newValue) {}

// 	adoptedCallback() {}
// }

export const setupStupidComponentAutoloader = async (context) => {
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
					this.innerHTML = `<pre>Error: ${JSON.stringify(templateResponse, null, 2)
						.replace(/[<>&"']/g, (ch) => ({
							'<': '&lt;',
							'>': '&gt;',
							'&': '&amp;',
							'"': '&quot;',
							'\'': '&apos;',
						}[ch]))
					}</pre>`;
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
