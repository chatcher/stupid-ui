import { StupidBaseRouteView } from '/engine/routes/stupid-base-route-view.js';

export class RootViewController extends StupidBaseRouteView {
	someProp = 'RootViewController.someProp';

	get username() {
		return this.$services.authService.username || 'waiting';
	}

	async beforeRouteEnter() {
		console.log('RootViewController::beforeRouteEnter() { return true }');
		const isAuthenticated = await this.$services.authService.isAuthenticated();
		console.log({ isAuthenticated });
		return isAuthenticated ? '/some/page' : '/login';
	}

	async logout() {
		return this.$services.authService.logout();
	}

	someMethod(something, event) {
		if (event.message) {
			this.someProp = event.message;
		}

		console.log('RootViewController::someMethod()', { something, event });
	}
}
