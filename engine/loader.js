import { components } from '../components.js';
import { setupStupidComponentAutoloader } from './components.js'

console.log({ components, setupStupidComponentAutoloader });

class Loader {
	promises = {};

	constructor(components) {
		Object.values(components).forEach((component) => {
			setupStupidComponentAutoloader(component);
		});
	}
}

export const loader = new Loader(components);
