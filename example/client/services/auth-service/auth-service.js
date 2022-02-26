import { StupidBaseService } from '/engine/services/stupid-base-service.js';

export class AuthService extends StupidBaseService {
	_username = 'static';

	get username() {
		return this.getAuth()
			.then((auth) => auth.username);
	}

	async getAuth() {
		const auth = await this.$services.storageService.get('auth');
		return auth || {};
	}

	async isAuthenticated() {
		const auth = await this.$services.storageService.get('auth');
		return !!auth;
	}

	async authenticate(credentials) {
		return this.$services.storageService.set('auth', credentials);
	}

	async logout() {
		console.log('logout()');
		await this.$services.storageService.remove('auth');
		const routeChange = await this.$router.changeRoute('/')
		console.log('after logout', { routeChange });
	}
}
