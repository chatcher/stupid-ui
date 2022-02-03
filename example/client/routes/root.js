export class RootViewController {
	someProp = 'RootViewController.someProp';

	constructor(element) {
	}

	someMethod(event) {
		console.log('RootViewController::someMethod()', { event });
	}
}
