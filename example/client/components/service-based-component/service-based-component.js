import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class ServiceBasedComponentController extends StupidBaseComponent {
	list = null;

	async onInit() {
		console.log('1', this);
		console.log('2', this.$services);
		console.log('3', this.$services.someService);
		console.log('4', this.$services.someService.getSomeData);
		this.list = await this.$services.someService.getSomeData();
		this.list = await this.$services.someService.getSomeData();
		this.list = await this.$services.someService.getSomeData();
		console.log('received', this.list);
		console.log(this.$services);
	}
}
