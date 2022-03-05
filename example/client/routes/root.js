import { StupidBaseRouteView } from '/engine/routes/stupid-base-route-view.js';

export class RootViewController extends StupidBaseRouteView {
	someProp = 'RootViewController.someProp';

	get username() {
		return this.$services.authService.username;
	}

	async beforeRouteEnter() {
		const isAuthenticated = await this.$services.authService.isAuthenticated();
		const authRoute = location.pathname === '/' ? '/some/page' : true;
		return isAuthenticated ? authRoute : '/login';
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
