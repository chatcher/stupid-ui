import { StupidBaseComponent } from '../stupid-base-component.js';

export class StupidSwitchController extends StupidBaseComponent {
	// $template = "<p>switch value: {{_value}}</p>";

	// value = 'null';
	_value = 'null';
	$current = null;
	$switchCases = {};

	set value(value) {
		console.log('switch', {value});
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
		console.log('StupidSwitchController::onInit()');
		this.$on('switch-case', (switchCase) => {
			console.group('switch-case');
			console.log(switchCase);
			console.log({
				switchCase,
				when: switchCase.when,
			});
			console.groupEnd();
			switchCase.$detach();
			this.$switchCases[switchCase.when] = switchCase;

			// setTimeout(() => switchCase.$reattach(), 1000);
		});
	}
}
