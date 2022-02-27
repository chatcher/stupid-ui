import {
	getTemplateValueMethod,
	getTemplateEventMethod,
} from './utilities/template-expressions.js';
import {
	listenForNativeChildNodes,
} from './utilities/native-elements-initialization.js';

export async function loadTemplate(context) {
	if (!context.template) {
		return null;
	}

	const templateResponse = await fetch(context.template);

	if (!templateResponse.ok) {
		console.error(`Error loading ${context.name} template.`);
		console.warn(templateResponse);
		return null;
	}

	return templateResponse.text();
}

export async function loadController(context) {
	if (!context.controller) {
		return null;
	}

	try {
		const controllerModule = await import(context.controller);
		const controllerClassName = `${context.name.replace(
			/(?:\b|\W)(\w)/g,
			(_, letter) => letter.toUpperCase()
		)}Controller`;

		if (!controllerModule) {
			console.error(`Empty ${context.name} module.`);
			return null;
		}

		if (!controllerModule[controllerClassName]) {
			console.warn(`No controller exported from ${context.name} module.`);
			console.log({ controllerClassName });
			console.info(controllerModule);
			return null;
		}

		return controllerModule[controllerClassName];
	} catch (error) {
		console.error(`Error loading ${context.name} module.`);
		console.warn(error);
		return null;
	}
}

export function connectHeirarchy(element) {
	notifyParentComponent(element);
	listenForChildComponents(element);
}

export function initializeTemplate(element, template) {
	convertPropertiesToWatchedProperties(element);

	if (template) {
		bindTemplateSlots(element, template);
		listenForNativeChildNodes(element);
		initializeTemplateLogic(element);
		populateTemplate(element);
	}

	if (element.slottedContent) {
		element.insertAdjacentHTML('beforeend', element.slottedContent.trim());
	}
}

// // // // // // // // // // // // // // // // // // // //

function notifyParentComponent(element) {
	element.dispatchEvent(new Event('stupid-component-created', { bubbles: true }));
}

function listenForChildComponents(element) {
	element.addEventListener('stupid-component-created', (event) => {
		event.stopPropagation();
		const child = event.target;
		console.debug(`StupidComponent<${element.context.name}>::child-attached`, child, { child });
		element.childComponents.push(child);
		watchChildEvents(element, child);
		bindDataToChild(element, child);
	});

	element.addEventListener('stupid-component-removed', (event) => {
		event.stopPropagation();
		const child = event.target;
		console.warn(`StupidComponent<${element.context.name}>::child-detached`, child, { child });
		const index = element.childComponents.indexOf(child);
		element.childComponents.splice(index, 1);
	});
}

function convertPropertiesToWatchedProperties(element) {
	const { controller } = element;

	if (!controller.$watch) {
		if (element.componentId) console.warn(element.componentId, 'is not watchable?');
		return;
	}

	Object.keys(controller)
		.filter((prop) => /^\w/.test(prop))
		.forEach((prop) => {
			const attribute = element.getAttribute(prop);
			if (attribute) element.controller[prop] = attribute;
			controller.$watch(prop, () => {
				populateTemplate(element);
				element.childComponents.forEach((child) => bindDataToChild(element, child));
			});
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

function initializeTemplateLogic(element) {
	const conditionals = Array.from(element.querySelectorAll('[if]'));
	conditionals.forEach((conditional) => {
		initializeTemplateConditional(element, conditional);
	});

	const iterations = Array.from(element.querySelectorAll('[for-each]'));
	iterations.forEach((iteration) => {
		initializeTemplateIteration(element, iteration);
	});
}

export function populateTemplate(element) {
	const bindings = element.querySelectorAll(`span[data-component="${element.componentId}"][data-expression]`);
	Array.from(bindings).forEach(async (span) => {
		const expression = span.getAttribute('data-expression');
		span.innerText = await executeTemplateExpression(element, expression.trim());
	});
}

// // // // // // // // // // // // // // // // // // // //

function watchChildEvents(element, child) {
	const { controller } = element;

	Array.from(child.attributes)
		.filter((attribute) => /^@/.test(attribute.name))
		.forEach((attribute) => {
			const eventName = attribute.name.slice(1);
			const expression = attribute.value.trim();
			const method = typeof controller[expression] === 'function'
				? (payload) => controller[expression](payload)
				: getTemplateEventMethod(element, expression);

			child.addEventListener(eventName, (event) => {
				event.stopPropagation();
				const { payload } = event;
				method(payload);
			});
		});
}

function bindDataToChild(element, child) {
	// todo
	Array.from(child.attributes)
		.filter((attribute) => /^#/.test(attribute.name))
		.forEach((attribute) => {
			const propName = attribute.name.replace(/-(\w)/g, (_, ch) => ch.toUpperCase()).slice(1);
			const expression = attribute.value.trim();
			if (expression in element.controller) {
				Reflect.set(child.controller, propName, element.controller[expression]);
			} else try {
				// TODO: security on eval
				const result = eval(`element.controller.${expression}`);
				Reflect.set(child.controller, propName, result);
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

function initializeTemplateConditional(element, conditional) {
	const expression = conditional.getAttribute('if');
	const slot = document.createElement('slot');
	slot.name = [
		element.componentId,
		Math.random().toString(16).substr(2, 6),
	].join('-');

	const method = getTemplateValueMethod(element, expression, recalculate);

	setContent(method());

	function recalculate() {
		setContent(method());
	}

	function setContent(show) {
		if (show) {
			slot.replaceWith(conditional);
		} else {
			conditional.replaceWith(slot);
		}
	}
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

	slot.name = [
		element.componentId,
		listName,
		Math.random().toString(16).substr(2, 6),
	].join('-');

	iteration.replaceWith(slot);
	iteration.removeAttribute('for-each');
	iteration.removeAttribute('#in');
	iteration.setAttribute('iteration-group', slot.name);

	const { controller } = element;

	controller.$watch(listName, (value) => {
		setContent(value);
	});

	function setContent(list) {
		Array.from(
			parent.querySelectorAll(`[iteration-group="${slot.name}"]`)
		).forEach((removal) => removal.remove());

		if (!list || !list.length) {
			return;
		}

		list.forEach((item) => {
			const injection = iteration.cloneNode(true);

			injection.controller = {}; // TODO: should use the stupid base component controller
			Reflect.set(injection.controller, itemName, item);

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
