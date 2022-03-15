import { getTemplateEventMethod } from './template-expressions.js';

export function listenForNativeChildNodes(element) {
	hijackInputBehavior(element);
	hijackFormSubmit(element);
	hijackButtonClick(element);

}

// // // // // // // // // // // // // // // // // // // //

function hijackInputBehavior(element) {
	const attributes = Array.from(element.attributes);
	const controller = element.controller;
	const inputs = Array.from(element.querySelectorAll('input'));
	inputs.forEach((input) => {
		const inputId = input.getAttribute('id');
		const elementId = element.getAttribute('id');

		if (elementId && !inputId) {
			input.setAttribute('id', `${elementId}-input`);
		}

		attributes.forEach(({ name, value }) => {
			console.log(name, value, input.getAttribute(name));
		});

		input.addEventListener('focus', (event) => {
			event.stopPropagation();
			controller.onFocus();
		});

		input.addEventListener('blur', (event) => {
			event.stopPropagation();
			controller.onBlur();
		});

		input.addEventListener('change', (event) => {
			console.log('input change', event);
		});

		input.addEventListener('input', (event) => {
			console.log('input', event);
		});

		input.addEventListener('invalid', (event) => {
			// event.stopPropagation();
			// event.preventDefault();
			console.log('invalid input', event);
			// console.log(input);
			console.log(event);
			controller.onError('invalid', event);
		});
	});
}

function hijackFormSubmit(element) {
	const forms = Array.from(element.querySelectorAll('form[\\@submit]'));
	forms.forEach((form) => {
		const expression = form.getAttribute('@submit');
		const submit = getTemplateEventMethod(element, expression);
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			const formData = Array.from(new FormData(form)).reduce((result, [key, value]) => ({
				...result,
				[key]: value,
			}), {});
			submit(formData);
		});
	});
}

function hijackButtonClick(element) {
	const clickies = Array.from(element.querySelectorAll('[\\@click]'));
	clickies.forEach((clickie) => {
		const expression = clickie.getAttribute('@click');
		const callback = getTemplateEventMethod(element, expression);
		clickie.addEventListener('click', (event) => {
			event.stopPropagation();
			callback('no');
		});
	});
}
