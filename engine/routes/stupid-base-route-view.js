import { StupidBaseComponent } from '../components/stupid-base-component.js';

export class StupidBaseRouteView extends StupidBaseComponent {
	onInit() {}

	async beforeRouteEnter() {
		return true;
	}

	$attach() {
		const routeSlot = document.querySelector('route-slot');
		if (routeSlot) {
			this.$socket = routeSlot;
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
