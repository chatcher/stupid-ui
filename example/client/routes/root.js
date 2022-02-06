export class RootViewController {
	someProp = 'RootViewController.someProp';

	someMethod(event) {
		console.log('RootViewController::someMethod()', { event });
	}
}
