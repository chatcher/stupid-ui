import { StupidBaseRouteView } from '/engine/routes/stupid-base-route-view.js';

export class LoginViewController extends StupidBaseRouteView {
	submit(data) {
		console.log('LoginController::submit()', { data });
		this.$services.authService.authenticate(data);
		this.$router.changeRoute('/');
	}
}
