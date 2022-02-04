import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class ConditionalComponentController extends StupidBaseComponent {
	constructor(element) {
		super(element);
	}

	value = 0;

	onInit() {
		const interval = setInterval(() => {
			this.value ++;
		}, 1000);
		setTimeout(() => {
			clearInterval(interval);
			this.value = 0;
		}, 5000);
	}
}
