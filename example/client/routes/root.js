export class RootController {
	someProp = 'RootController.someProp';

	constructor() {
		console.log('RootController::constructor()');
	}

	someMethod(event) {
		console.log('RootController::someMethod()', { event });
	}
}

class PrivateClass {}
