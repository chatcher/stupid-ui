import { StupidBaseComponent } from '../stupid-base-component.js';

export class StupidSwitchController extends StupidBaseComponent {
	_value = 'null';
	$current = null;
	$switchCases = {};

	set value(value) {
		this._value = value;
		if (this.$current) {
			this.$current.$detach();
		}
		this.$current = this.$switchCases[value] || null;
		if(this.$current) {
			this.$current.$reattach();
		}
	}

	onInit() {
		this.$on('switch-case', (switchCase) => {
			switchCase.$detach();
			this.$switchCases[switchCase.when] = switchCase;
		});
	}
}
