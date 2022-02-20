import { StupidBaseComponent } from '../components/stupid-base-component.js';

export class StupidBaseRouteView extends StupidBaseComponent {
	onInit() {}

	async beforeRouteEnter() {
		return true;
	}


	attach() {
		console.log({ 'my element:': this.$element });
		const routeSlot = document.querySelector('route-slot');
		if (routeSlot) {
			this.$routeSlot = routeSlot;
			console.log('i found a route slot:', this.$routeSlot);
			this.$routeSlot.replaceWith(this.$element);
		} else {
			console.error('could not find a route slot');
		}
	}

	detach() {
		this.$element.replaceWith(this.$routeSlot);
		this.$routeSlot = null;
	}

}
