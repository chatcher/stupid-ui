import { StupidBaseRouteView } from '/engine/components/stupid-base-route-view.js';

export class RootViewController extends StupidBaseRouteView {
	someProp = 'RootViewController.someProp';

	beforeRouteEnter() {
		console.log('before route enter');
		return true;
	}

	someMethod(event) {
		console.log('RootViewController::someMethod()', { event });
	}
}
