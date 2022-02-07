import { StupidBaseService } from '/engine/services/stupid-base-service.js';

export class SomeService extends StupidBaseService {
	getSomeData() {
		return new Promise((resolve) => {
			setTimeout(resolve, 1000, [1, 2, 3]);
		});
	}
}
