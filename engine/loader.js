import { components } from '../components.js';
import { setupStupidComponentAutoloader } from './component-loader.js'
import { router } from './router.js';

Object.values(components).forEach((component) => {
	setupStupidComponentAutoloader(component, router);
});
