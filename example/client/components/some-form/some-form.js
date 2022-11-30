import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class SomeFormController extends StupidBaseComponent {
	dropdownOptions = [{
		label: 'one',
		value: 1,
	}, {
		label: 'two',
		value: 2,
	}, {
		label: 'three',
		value: 3,
	}];

	dropdownValue = null;

	async onInit() {
		const url = 'http://localhost:3000/api/tasks';
		const response = await this.$services.$http.get(url);
		console.log(response);
	}
}
