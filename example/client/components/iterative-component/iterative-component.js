import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class IterativeComponentController extends StupidBaseComponent {
	list = [
		'one',
		'two',
	];

	onInit() {
		setTimeout(() => this.list.push('three'), 2000);
		setTimeout(() => this.list.push('four'), 4000);
		setTimeout(() => this.list.push('five'), 6000);
	}
}
