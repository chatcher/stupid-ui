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
		const slot = element.querySelector('slot:not([name])');
		if (slot) {
			slot.insertAdjacentHTML('beforeend', element.slottedContent.trim());
		} else {
			element.insertAdjacentHTML('beforeend', element.slottedContent.trim());
		}
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
			controller.$watch(prop, () => {
				populateTemplate(element);
				element.childComponents.forEach((child) => bindDataToChild(element, child));
			});

			const attribute = element.getAttribute(prop);
			if (attribute) element.controller[prop] = attribute;
		});
}

function bindTemplateSlots(element, template) {
	element.innerHTML = template;

	const walker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_TEXT,
		null,
		false
	);

	const nodes = [];
	let node;

	while(node = walker.nextNode()) {
		if (/\{\{.*\}\}/.test(node.nodeValue)) {
			nodes.push(node);
		}
	}

	const candidates = [];
	nodes.forEach((node) => {
		const parentNode = node.parentNode;
		const text = node.nodeValue.trim();
		text.split('{{')
			.slice(1)
			.forEach((fragment) => {
				const rawExpression = fragment.split('}}')[0];
				// candidates.push({
					// node,
				const text = `{{${rawExpression}}}`;
				const expression = rawExpression.trim();
				// });
				initializeTemplateBinding(element, expression, parentNode, text);
			});
	});

	// candidates.forEach(({ node, text, expression }) => {
	// });
}

function initializeTemplateLogic(element) {
	const conditionals = Array.from(element.querySelectorAll('[if]'));
	element.controller.$conditionalExpressions = conditionals.map((conditional) => (
		initializeTemplateConditional(element, conditional)
	));

	const iterations = Array.from(element.querySelectorAll('[for-each]'));
	iterations.forEach((iteration) => {
		initializeTemplateIteration(element, iteration);
	});
}

export function populateTemplate(element) {
	const expressions = element.controller.$conditionalExpressions || [];
	expressions.forEach((recalculate) => recalculate());

	setTimeout(() => {
		const bindings = element.querySelectorAll(`span[data-component="${element.componentId}"][data-expression]`);
		Array.from(bindings).forEach(async (span) => {
			const expression = span.getAttribute('data-expression');
			const substitution = await executeTemplateExpression(element, expression.trim());
			span.innerText = substitution;
		});
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

function initializeTemplateBinding(element, expression, node, text) {
	const name = [
		element.componentId,
		Math.random().toString(16).substr(2, 6),
	].join('-');
	node.innerHTML = node.innerHTML.replace(text, `<slot name="${name}">...</slot>`);
	const slot = node.querySelector(`slot[name="${name}"]`);

	const method = getTemplateValueMethod(element, expression, recalculate);

	recalculate();

	return recalculate;

	function recalculate() {
		setContent(method());
	}

	async function setContent(value) {
		slot.textContent = await value;
	}
}

function initializeTemplateConditional(element, conditional) {
	const expression = conditional.getAttribute('if');
	const slot = document.createElement('slot');
	slot.name = [
		element.componentId,
		Math.random().toString(16).substr(2, 6),
	].join('-');

	const method = getTemplateValueMethod(element, expression, recalculate);

	recalculate();

	return recalculate;

	function recalculate() {
		setContent(method());
	}

	async function setContent(show) {
		if (await show) {
			slot.replaceWith(conditional);
		} else {
			conditional.replaceWith(slot);
		}
	}
}

function initializeTemplateIteration(element, iteration) {
	if (!(iteration.getAttribute('in') in element.controller)) {
		console.error('Property not found for iteration:', iteration.getAttribute('in'));
		return;
	}

	const listName = iteration.getAttribute('in');
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
	iteration.removeAttribute('in');
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

			// TODO: should use the stupid base component controller
			injection.controller = {};
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
