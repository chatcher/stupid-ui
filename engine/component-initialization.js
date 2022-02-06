export function connectHeirarchy(element) {
	notifyParentComponent(element);
	listenForChildComponents(element);
}

export function initializeTemplate(element, template) {
	convertPropertiesToWatchedProperties(element);

	if(template) {
		bindTemplateSlots(element, template);
		initializeTemplateIterations(element);
		populateTemplate(element);
	}

	if (element.slottedContent) {
		element.insertAdjacentHTML('beforeend', element.slottedContent.trim());
	}
}

////////////////////////////////////////////////////////////

function notifyParentComponent(element) {
	element.dispatchEvent(new Event('stupid-component-created', { bubbles: true }));
}

function listenForChildComponents(element) {
	element.addEventListener('stupid-component-created', (event) => {
		event.stopPropagation();
		const child = event.target;
		console.debug(`StupidComponent<${element.context.name}>::child-attached`, child, { child });
		element.children.push(child);
		watchChildEvents(element, child);
		bindDataToChild(element, child);
	});

	element.addEventListener('stupid-component-removed', () => {
		event.stopPropagation();
		const child = event.target;
		console.warn(`StupidComponent<${element.context.name}>::child-detached`, child, { child });
		const index = element.children.indexOf(child);
		element.children.splice(index, 1);
	});
}

function convertPropertiesToWatchedProperties(element) {
	Object.keys(element.controller)
		.filter((prop) => /^\w/.test(prop))
		.forEach((prop) => {
			let _value = element.getAttribute(prop) || element.controller[prop] || null;

			Object.defineProperty(
				element.controller,
				prop,
				{
					enumerable: true,
					get: () => _value,
					set: (value) => {
						_value = value;
						populateTemplate(element);
						element.children.forEach((child) => bindDataToChild(element, child));
					}
				}
			);
		});
}

function bindTemplateSlots(element, template) {
	const bindings = template.trim().split('{{');
	const templateParts = [bindings.shift()];
	bindings.map((fragment) => fragment.split('}}'))
		.forEach(([unsafeExpression, trailer]) => {
			const slot = getBindingReplacementSlot(element, unsafeExpression);
			templateParts.push(slot);
			templateParts.push(trailer);
		});

	element.innerHTML = templateParts.join('');
}

function initializeTemplateIterations(element) {
	const iterations = Array.from(element.querySelectorAll('[for-each]'));

	if (iterations.length) {
		iterations.forEach((iteration) => {
			initializeTemplateIteration(element, iteration);
		});
	}
}

function populateTemplate(element) {
	const bindings = element.querySelectorAll(`span[data-component="${element.componentId}"][data-expression]`);
	Array.from(bindings).forEach((span) => {
		const expression = span.getAttribute('data-expression');
		span.innerText = executeTemplateExpression(element, expression.trim());
	});
}

////////////////////////////////////////////////////////////

function watchChildEvents(element, child) {
	Array.from(child.attributes)
		.filter((attribute) => /^@/.test(attribute.name))
		.forEach((attribute) => {
			const eventName = attribute.name.slice(1);
			const callbackExpression = attribute.value.trim();
			console.debug(eventName, '->', callbackExpression);

			if (typeof element.controller[callbackExpression] === 'function') {
				child.addEventListener(eventName, (event) => {
					event.stopPropagation();
					const payload = event.payload;
					element.controller[callbackExpression](payload);
				});
			} else {
				console.group(element.context.name);
				console.log(element);
				console.log({ element });
				console.log(child)
				console.log({ child });
				console.error('unsupported callback expression');
				console.log(callbackExpression);
				console.groupEnd();
			}
		});
}

function bindDataToChild(element, child) {
	Array.from(child.attributes)
		.filter((attribute) => /^#/.test(attribute.name))
		.forEach((attribute) => {
			const propName = attribute.name.replace(/-(\w)/g, (_, ch) => ch.toUpperCase()).slice(1);
			const expression = attribute.value.trim();
			if (expression in element.controller) {
				child.controller[propName] = element.controller[expression];
			} else try {
				// TODO: security on eval
				const result = eval(`element.controller.${expression}`)
				child.controller[propName] = result;
			} catch (error) {
				console.error('unsupported binding expression', expression);
				console.error(error);
			}
		});
}

function getBindingReplacementSlot(element, unsafeExpression) {
	const expression = unsafeExpression.trim();

	if (expression in element.controller) {
		const slotName = `${element.componentId}-slot-${Math.random().toString(16).substr(2)}`;
		return `<slot
			name="${slotName}"
			/><span
			data-component="${element.componentId}"
			data-expression="${expression}"
			slot="${slotName}"
			>...</span>`;
	}

	return `{{${expression}}}`;
}

function initializeTemplateIteration(element, iteration) {
	if (!(iteration.getAttribute('#in') in element.controller)) {
		console.error('Property not found for iteration:', iteration.getAttribute('#in'));
		return;
	}

	const listName = iteration.getAttribute('#in');
	const parent = iteration.parentElement;
	const itemName = iteration.getAttribute('for-each');
	const template = iteration.innerHTML;
	const slot = document.createElement('slot');
	const dataSource = Object.getOwnPropertyDescriptor(element.controller, listName);

	slot.name = [
		element.componentId,
		listName,
		Math.random().toString(16).substr(2, 6),
	].join('-');

	iteration.replaceWith(slot);
	iteration.removeAttribute('for-each');
	iteration.removeAttribute('#in');
	iteration.setAttribute('iteration-group', slot.name);


	setProxy();
	setContent();

	function setProxy() {
		const proxy = new Proxy(dataSource.get(), {
			get: (self, prop) => {
				return self[prop];
			},
			set: (self, prop, value) => {
				self[prop] = value;
				setContent();
				return true;
			},
		});

		Object.defineProperty(element.controller, listName, {
			get: () => proxy,
			set: (value) => {
				dataSource.set(value);
				setProxy();
			},
		});
	}

	function setContent() {
		Array.from(
			parent.querySelectorAll(`[iteration-group="${slot.name}"]`)
		).forEach((removal) => removal.remove());

		dataSource.get().forEach((item) => {
			const injection = iteration.cloneNode(true);

			injection.controller = {};
			injection.controller[itemName] = item;

			initializeTemplate(injection, template);

			slot.before(injection);
		});
	}
}

function executeTemplateExpression(element, expression) {
	if (expression in element.controller) {
		return element.controller[expression];
	}

	console.group(element.context.name);
	console.error('Unknown/unsupported template expression:', expression);
	console.log(element);
	console.log({ element });
	console.log(element, element.controller);
	console.log({ controler: element.controller });
	console.log(element, element.controller[expression]);
	console.log({
		expression,
		value: element.controller[expression],
	});
	console.groupEnd();

	return `{{${expression}}}`;
}
