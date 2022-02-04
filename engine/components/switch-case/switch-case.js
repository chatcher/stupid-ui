import { StupidBaseComponent } from '../stupid-base-component.js';

export class SwitchCaseController extends StupidBaseComponent {
	when = NaN;

	onInit() {
		this.$emit('switch-case', this);
	}
}
