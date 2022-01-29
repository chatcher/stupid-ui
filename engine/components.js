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
	let template = `<p>No template for ${context.name}</p>`;

	if (context.template) {
		const templateResponse = await fetch(context.template);
		if (templateResponse.ok) {
			template = await templateResponse.text();
		} else {
			template = `<pre>Error: ${JSON.stringify(templateResponse, null, 2)
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

	const controllerModule = context.controller ? await import(context.controller) : null;
	const controllerClassName = `${context.name.replace(
		/(?:\b|\W)(\w)/g,
		(_, letter) => letter.toUpperCase()
	)}Controller`;
	const Controller = controllerModule ? controllerModule[controllerClassName] : null;

	class StupidComponentAutoloader extends HTMLElement {
		constructor() {
			super();
			console.log('StupidComponentAutoloader::constructor()', { context });
			this.innerHTML = template;
			this.controller = Controller ? new Controller(this) : null;
		}
	}

	customElements.define(
		context.name,
		StupidComponentAutoloader,
	);
};
