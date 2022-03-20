import { StupidBaseRouteView } from '/engine/routes/stupid-base-route-view.js';

export class BindingsViewController extends StupidBaseRouteView {
	object = {
		property: 'success',
	};

	onInit() {
		console.log('bindings on init');
		setTimeout(() => {
			this.object.property = 'modified';
		}, 1000);
	}
}
