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

const componentCache = {};

export const setupStupidComponentAutoloader = async (context, router) => {
	if (!componentCache[context.name]) {
		componentCache[context.name] = Promise.all([
			loadTemplate(context),
			loadController(context),
		]).then(([
			template,
			Controller,
		]) => {
			class StupidComponent extends HTMLElement {
				children = [];

				constructor() {
					super();

					console.log(`StupidComponent<${context.name}>::constructor()`, { context });

					this.template = template;
					this.controller = Controller ? new Controller(this) : {};

					this.connectHeirarchy();
					this.initializeTemplate();
				}

				connectHeirarchy() {
					this.convertPropertiesToWatchedProperties();
					this.notifyParentComponent();
					this.listenForChildComponents();
				}

				initializeTemplate() {
					this.innerHTML = this.template;
					this.populateTemplate();
				}

				convertPropertiesToWatchedProperties() {
					const props = Object.keys(this.controller).filter((prop) => /^\w/.test(prop));
					console.log(`StupidComponent<${context.name}>::convertPropertiesToWatchedProperties()`, { props });
					props.forEach((prop) => {
						let _value = this.controller[prop];

						Object.defineProperty(
							this.controller,
							prop,
							{
								enumerable: true,
								get: () => _value,
								set: (value) => {
									console.log('value change', _value, 'to', value);
									_value = value;
									this.populateTemplate();
									this.children.forEach((child) => this.bindDataToChild(child));
								}
							}
						);
					});
				}

				notifyParentComponent() {
					this.dispatchEvent(new Event('stupid-component-created', { bubbles: true }));
				}

				listenForChildComponents() {
					this.addEventListener('stupid-component-created', (event) => {
						event.stopPropagation();
						const child = event.target;
						console.log(`StupidComponent<${context.name}>::child-attached`, child, { child });
						this.children.push(child);
						this.watchChildEvents(child);
						this.bindDataToChild(child);
					});

					this.addEventListener('stupid-component-removed', () => {
						event.stopPropagation();
						const child = event.target;
						console.log(`StupidComponent<${context.name}>::child-detached`, child, { child });
						const index = this.children.indexOf(child);
						this.children.splice(index, 1);
					});
				}

				watchChildEvents(child) {
					const attributes = Array.from(child.attributes)
						.filter((attribute) => /^@/.test(attribute.name))

					attributes.forEach((attribute) => {
						const eventName = attribute.name.slice(1);
						const callbackExpression = attribute.value.trim();
						console.log(eventName, '->', callbackExpression);

						if (this.controller[callbackExpression]) {
							child.addEventListener(eventName, (event) => {
								event.stopPropagation();
								const payload = event.payload;
								this.controller[callbackExpression](payload);
							});
						} else {
							console.log('unsupported callback expression', callbackExpression);
						}
					});
				}

				bindDataToChild(child) {
					const attributes = Array.from(child.attributes)
						.filter((attribute) => /^#/.test(attribute.name))

					attributes.forEach((attribute) => {
						const propName = attribute.name.replace(/-(\w)/g, (_, ch) => ch.toUpperCase()).slice(1);
						const bindingExpression = attribute.value.trim();
						if (this.controller.hasOwnProperty(bindingExpression)) {
							child.controller[propName] = this.controller[bindingExpression];
						} else {
							console.log('unsupported binding expression', bindingExpression);
						}
					});
				}

				populateTemplate() {
					const iter = document.createNodeIterator(this, NodeFilter.SHOW_TEXT);

					let textnode;

					while (textnode = iter.nextNode()) {
						const matches = /\{\{.*\}\}/.test(textnode.textContent);

						if (matches) {
							const content = textnode.nodeValue;
							textnode.nodeValue = content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, expression) => {
								return this.executeTemplateExpression(expression.trim());
							});
						}
					}
				}

				executeTemplateExpression(expression) {
					if (this.controller.hasOwnProperty(expression)) {
						return this.controller[expression];
					}
					return `?${expression}?`;
				}

				connectedCallback() {
					if (this.controller && this.controller.onInit) {
						this.controller.onInit();
					}
				}

				disconnectedCallback() {
					console.error(`StupidComponent<${context.name}>::disconnect()`);
				}
			}

			customElements.define(
				context.name,
				StupidComponent,
			);
		});
	}

	return componentCache[context.name];
};
