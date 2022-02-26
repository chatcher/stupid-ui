import { StupidBaseRouteView } from '/engine/routes/stupid-base-route-view.js';

export class PageViewController extends StupidBaseRouteView {
	someProp = 'PageViewController.someProp';

	async beforeRouteEnter() {
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
