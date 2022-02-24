import { StupidBaseComponent } from '../components/stupid-base-component.js';

export class StupidBaseRouteView extends StupidBaseComponent {
	onInit() {}

	async beforeRouteEnter() {
		return true;
	}

	$attach() {
		console.log({ '$attach my element': this.$element });
		const routeSlot = document.querySelector('route-slot');
		if (routeSlot) {
			this.$socket = routeSlot;
			console.log('i found a route slot:', this.$socket);
			this.$socket.replaceWith(this.$element);
			this.$emit('stupid-route-attached', this);
		} else {
			console.error('could not find a route slot');
		}
	}

	$detach() {
		this.$element.replaceWith(this.$socket);
		this.$socket = null;
	}
}
