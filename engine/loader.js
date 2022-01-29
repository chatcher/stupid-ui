import { components } from '../components.js';
import { setupStupidComponentAutoloader } from './components.js'

Object.values(components).forEach((component) => {
	setupStupidComponentAutoloader(component);
});
