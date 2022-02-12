import { StupidBaseRouteView } from '/engine/components/stupid-base-route-view.js';

export class SomePageViewController extends StupidBaseRouteView {
	someProp = 'PageViewController.someProp';

	beforeRouteEnter() {
		console.log('PageViewController::beforeRouteEnter() { return true }');
		return true;
	}

	someMethod(something, event) {
		if (event.message) {
			this.someProp = event.message;
		}

		console.log('PageViewController::someMethod()', { something, event });
	}
}
