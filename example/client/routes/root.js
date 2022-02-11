import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class RootViewController extends StupidBaseComponent {
	someProp = 'RootViewController.someProp';

	someMethod(event) {
		console.log('RootViewController::someMethod()', { event });
	}
}
