import { components as engineComponents } from './components.js';
import { components } from '../components.js';
import { setupStupidComponentAutoloader } from './component-loader.js';
import { router } from './router.js';
import { services } from './services.js';

services.$router = router;

Object.values(engineComponents).forEach((component) => {
	setupStupidComponentAutoloader(component, router);
});

Object.values(components).forEach((component) => {
	setupStupidComponentAutoloader(component, router);
});
