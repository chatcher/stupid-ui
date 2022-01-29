// export class CustomComponent extends HTMLElement {
// 	constructor() {
// 		super();
// 	}

// 	connectedCallback() {}

// 	disconnectedCallback() {}

// 	attributeChangedCallback(name, oldValue, newValue) {}

// 	adoptedCallback() {}
// }

const loadTemplate = async (context) => {
	if (!context.template) {
		return `<p>No template for ${context.name}</p>`;
	}

	const templateResponse = await fetch(context.template);

	return templateResponse.ok ?
		templateResponse.text() :
		`<pre>Error: ${JSON.stringify(templateResponse, null, 2)
			.replace(/[<>&"']/g, (ch) => ({
				'<': '&lt;',
				'>': '&gt;',
				'&': '&amp;',
				'"': '&quot;',
				'\'': '&apos;',
			}[ch]))
		}</pre>`;
};

export const setupStupidComponentAutoloader = async (context) => {
	const template = await loadTemplate(context);

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
