import { components as engineComponents } from './components.js';
import { components } from '../components.js';
import { route as engineRootRoute } from './routes.js';
import { route as projectRootRoute } from '../routes.js';
import { setupStupidComponentAutoloader, setupStupidComponent } from './component-loader.js';
import { router, StupidRouterViewController } from './router.js';
import { services } from './services.js';

services.$router = router;

Object.values(engineComponents).forEach((component) => {
	setupStupidComponentAutoloader(component, router);
});

Object.values(components).forEach((component) => {
	setupStupidComponentAutoloader(component, router);
});


async function recurseRoutes(route) {
	console.log('recurseRoutes()', route);
	// if (!route.template) {
	// 	route.template = `<slot name=${route.name}>?</slot>`;
	// }
	await setupStupidComponentAutoloader(route, router, StupidRouterViewController, '<route-slot></route-slot>');
	await Promise.all(Object.values(route.routes).map(recurseRoutes));
}
recurseRoutes(projectRootRoute);
recurseRoutes(engineRootRoute);



// setupStupidComponent({
// 	context: projectRootRoute,
// 	router,
// 	template: '<p>dunno</p>',
// 	Controller: StupidRouterViewController,
// })

// Object.values(projectRootRoute).forEach((component) => {
// 	setupStupidComponentAutoloader(component, router, StupidRouterViewController);
// });

// Object.values(engineRootRoute).forEach((component) => {
// 	setupStupidComponentAutoloader(component, router, StupidRouterViewController);
// });
