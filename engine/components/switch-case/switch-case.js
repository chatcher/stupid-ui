import { StupidBaseComponent } from '../stupid-base-component.js';

export class SwitchCaseController extends StupidBaseComponent {
	// $template = '<span>[{{when}}]</span>';

	when = NaN;

	onInit() {
		console.log('SwitchCaseController::onInit()');
		this.$emit('switch-case', this);
	}
}
