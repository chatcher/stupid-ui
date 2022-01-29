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

const loadController = async (context) => {
	const controllerModule = context.controller ? await import(context.controller) : null;
	const controllerClassName = `${context.name.replace(
		/(?:\b|\W)(\w)/g,
		(_, letter) => letter.toUpperCase()
	)}Controller`;
	return controllerModule ? controllerModule[controllerClassName] : null;
};

export const setupStupidComponentAutoloader = async (context, router) => {
	const template = await loadTemplate(context);
	const Controller = await loadController(context);

	class StupidComponent extends HTMLElement {
		constructor() {
			super();
			console.log(`StupidComponent<${context.name}>::constructor()`, { context });
			this.innerHTML = template;
			this.controller = Controller ? new Controller(this) : null;

			const anchors = this.querySelectorAll('a');
			Array.from(anchors).forEach((anchor) => {
				const href = anchor.getAttribute('href')
				if (router.routes[href]) {
					anchor.addEventListener('click', (event) => {
						event.preventDefault();
						router.changeRoute(href);
					});
				}
			});
		}
	}

	customElements.define(
		context.name,
		StupidComponent,
	);
};
