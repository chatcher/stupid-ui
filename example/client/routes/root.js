import { StupidBaseRouteView } from '/engine/components/stupid-base-route-view.js';

export class RootViewController extends StupidBaseRouteView {
	someProp = 'RootViewController.someProp';

	beforeRouteEnter() {
		console.log('RootViewController::beforeRouteEnter() { return true }');
		return true;
	}

	someMethod(something, event) {
		if (event.message) {
			this.someProp = event.message;
		}
		console.log('RootViewController::someMethod()', { something, event });
	}
}
