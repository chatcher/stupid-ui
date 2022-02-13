import { StupidBaseService } from '/engine/services/stupid-base-service.js';

export class StorageService extends StupidBaseService {
	get(key) {
		const value = localStorage.getItem(key)
		return value ? JSON.parse(value) : null;
	}

	set(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	remove(key, value) {
		localStorage.removeItem(key);
	}
}
