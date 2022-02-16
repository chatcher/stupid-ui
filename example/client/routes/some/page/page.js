import { StupidBaseRouteView } from '/engine/components/stupid-base-route-view.js';

export class PageViewController extends StupidBaseRouteView {
	someProp = 'PageViewController.someProp';

	async beforeRouteEnter() {
		console.log('PageViewController::beforeRouteEnter() { return true }');
		return true;
	}

	async logout() {
		return this.$services.authService.logout();
	}

	someMethod(something, event) {
		if (event.message) {
			this.someProp = event.message;
		}

		console.log('PageViewController::someMethod()', { something, event });
	}
}
