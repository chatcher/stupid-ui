import { components } from '../components.js';
import { stupidTemplateComponent, setupStupidComponentAutoloader } from './components.js'

console.log({ components, stupidTemplateComponent, setupStupidComponentAutoloader });

class Loader {
	promises = {};

	constructor(components) {
		Object.values(components).forEach((component) => {
			setupStupidComponentAutoloader(component);
		});
	}
}

export const loader = new Loader(components);
