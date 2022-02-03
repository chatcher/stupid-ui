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

					console.debug(`StupidComponent<${context.name}>::constructor()`, { context });

					this.componentId = `${context.name}-${Math.random().toString(16).substr(2)}`;
					this.controller = Controller ? new Controller(this) : {};

					this.connectHeirarchy();
					this.initializeTemplate(template);
				}

				connectHeirarchy() {
					this.notifyParentComponent();
					this.listenForChildComponents();
				}

				initializeTemplate(template) {
					this.convertPropertiesToWatchedProperties();
					this.bindTemplateSlots(template);
					this.populateTemplate();
				}

				bindTemplateSlots(template) {
					const bindings = template.trim().split('{{');
					const templateParts = [bindings.shift()];
					bindings.map((fragment) => fragment.split('}}'))
						.forEach(([unsafeExpression, trailer]) => {
							const expression = unsafeExpression.trim();
							const slotName = `${this.componentId}-slot-${Math.random().toString(16).substr(2)}`;
							const slot = `<slot
								name="${slotName}"
								/><span
								data-component="${this.componentId}"
								data-expression="${expression}"
								slot="${slotName}"
								>...</span>`;
							templateParts.push(slot);
							templateParts.push(trailer);
						});
					this.innerHTML = templateParts.join('');
				}

				populateTemplate() {
					const bindings = this.querySelectorAll(`span[data-component="${this.componentId}"][data-expression]`);
					Array.from(bindings).forEach((span) => {
						const expression = span.getAttribute('data-expression');
						span.innerText = this.executeTemplateExpression(expression.trim());
					});
				}

				executeTemplateExpression(expression) {
					if (expression in this.controller) {
						return this.controller[expression];
					}

					console.group(context.name);
					console.error('Unknown/unsupported template expression:', expression);
					console.log(this);
					console.log({ this: this });
					console.log(this.controller);
					console.log({ controler: this.controller });
					console.log(this.controller[expression]);
					console.log({
						expression,
						value: this.controller[expression],
					});
					console.groupEnd();

					return `?${context.name}:${expression}?`;
				}

				convertPropertiesToWatchedProperties() {
					const props = Object.keys(this.controller).filter((prop) => /^\w/.test(prop));
					console.debug(`StupidComponent<${context.name}>::convertPropertiesToWatchedProperties()`, { props });
					props.forEach((prop) => {
						let _value = this.getAttribute(prop) || this.controller[prop] || null;

						Object.defineProperty(
							this.controller,
							prop,
							{
								enumerable: true,
								get: () => _value,
								set: (value) => {
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
						console.debug(`StupidComponent<${context.name}>::child-attached`, child, { child });
						this.children.push(child);
						this.watchChildEvents(child);
						this.bindDataToChild(child);
					});

					this.addEventListener('stupid-component-removed', () => {
						event.stopPropagation();
						const child = event.target;
						console.warn(`StupidComponent<${context.name}>::child-detached`, child, { child });
						const index = this.children.indexOf(child);
						this.children.splice(index, 1);
					});
				}

				watchChildEvents(child) {
					Array.from(child.attributes)
						.filter((attribute) => /^@/.test(attribute.name))
						.forEach((attribute) => {
							const eventName = attribute.name.slice(1);
							const callbackExpression = attribute.value.trim();
							console.debug(eventName, '->', callbackExpression);

							if (typeof this.controller[callbackExpression] === 'function') {
								child.addEventListener(eventName, (event) => {
									event.stopPropagation();
									const payload = event.payload;
									this.controller[callbackExpression](payload);
								});
							} else {
								console.group(context.name);
								console.log(this);
								console.log({ this: this });
								console.log(child)
								console.log({ child });
								console.error('unsupported callback expression');
								console.log(callbackExpression);
								console.groupEnd();
							}
						});
				}

				bindDataToChild(child) {
					Array.from(child.attributes)
						.filter((attribute) => /^#/.test(attribute.name))
						.forEach((attribute) => {
							const propName = attribute.name.replace(/-(\w)/g, (_, ch) => ch.toUpperCase()).slice(1);
							const expression = attribute.value.trim();
							if (expression in this.controller) {
								child.controller[propName] = this.controller[expression];
							} else {
								console.error('unsupported binding expression', expression);
							}
						});
				}

				connectedCallback() {
					if (this.controller && this.controller.onInit) {
						this.controller.onInit();
					}
				}

				disconnectedCallback() {
					console.warn(`StupidComponent<${context.name}>::disconnect()`);
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
