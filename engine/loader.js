import { components } from '../components.js';
import { setupStupidComponentAutoloader } from './components.js'

console.log({ components, setupStupidComponentAutoloader });

Object.values(components).forEach((component) => {
	setupStupidComponentAutoloader(component);
});
