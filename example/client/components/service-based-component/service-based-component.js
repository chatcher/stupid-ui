import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class ServiceBasedComponentController extends StupidBaseComponent {
	list = null;

	async onInit() {
		this.list = await this.$services.someService.getSomeData();
	}
}
