import { components } from '../components.js';
import { setupStupidComponentAutoloader } from './components.js'
import { router } from './routing.js';

Object.values(components).forEach((component) => {
	setupStupidComponentAutoloader(component, router);
});
