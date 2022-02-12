import { getTemplateEventMethod } from './template-expressions.js';

export function listenForNativeChildNodes(element) {
	console.log('listenForNativeChildNodes()');
	hijackFormSubmit(element);
	hijackButtonClick(element);
}

// // // // // // // // // // // // // // // // // // // //

function hijackFormSubmit(element) {
	const forms = Array.from(element.querySelectorAll('form[\\@submit]'));
	console.log({ forms });
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
	console.log({ clickies });
	clickies.forEach((clickie) => {
		const expression = clickie.getAttribute('@click');
		const callback = getTemplateEventMethod(element, expression);
		clickie.addEventListener('click', (event) => {
			event.stopPropagation();
			callback('no');
		});
	});
}
