import { StupidBaseRouteView } from '/engine/components/stupid-base-route-view.js';

export class RootViewController extends StupidBaseRouteView {
	someProp = 'RootViewController.someProp';

	async beforeRouteEnter() {
		console.log('RootViewController::beforeRouteEnter() { return true }');
		const isAuthenticated = await this.$services.authService.isAuthenticated();
		console.log({ isAuthenticated });
		return isAuthenticated ? '/some/page' : '/login';
	}

	someMethod(something, event) {
		if (event.message) {
			this.someProp = event.message;
		}

		console.log('RootViewController::someMethod()', { something, event });
	}
}
