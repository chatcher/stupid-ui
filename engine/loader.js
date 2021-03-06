import { components as engineComponents } from './components/components.js';
import { components } from '../components.js';
import { route as engineRootRoute } from './routes/routes.js';
import { route as projectRootRoute } from '../routes.js';
import { setupStupidComponentAutoloader, markLoadingComplete } from './component-loader.js';
import { router, StupidRouterViewController } from './router.js';
import { services } from './services/services.js';

services.$router = router;

async function recurseRoutes(route) {
	await setupStupidComponentAutoloader(route, router, StupidRouterViewController, '<route-slot></route-slot>');
	await Promise.all(Object.values(route.routes).map(recurseRoutes));
}

async function loadEngine() {
	const engineComponentPromises = Object.values(engineComponents).map((component) => (
		setupStupidComponentAutoloader(component, router)
	));

	const projectComponentPromises = Object.values(components).map((component) => (
		setupStupidComponentAutoloader(component, router)
	));

	await Promise.all([
		...engineComponentPromises,
		...projectComponentPromises,
		recurseRoutes(projectRootRoute),
		recurseRoutes(engineRootRoute),
	]);

	await markLoadingComplete('engine');
	await router.init();
}

loadEngine();
