import { StupidBaseComponent } from './stupid-base-component.js';

export class StupidBaseRouteView extends StupidBaseComponent {
	onInit() {}

	async beforeRouteEnter() {
		return true;
	}
}
