export class RootViewController {
	someProp = 'RootViewController.someProp';

	constructor(element) {
		console.log('RootViewController::constructor()', { element });
	}

	someMethod(event) {
		console.log('RootViewController::someMethod()', { event });
	}
}
