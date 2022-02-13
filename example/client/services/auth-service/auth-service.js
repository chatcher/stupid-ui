import { StupidBaseService } from '/engine/services/stupid-base-service.js';

export class AuthService extends StupidBaseService {
	async isAuthenticated() {
		const auth = this.$services.storageService.get('auth');
		return auth;
	}

	async authenticate(credentials) {
		this.$services.storageService.set('auth', credentials);
	}

	async logout() {
		console.group('logout()');
		this.$services.storageService.remove('auth');
		const routeChange = this.$router.changeRoute('/')
		console.log({ routeChange });
		console.groupEnd();
	}
}
