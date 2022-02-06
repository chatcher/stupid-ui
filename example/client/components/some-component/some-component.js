import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class SomeComponentController extends StupidBaseComponent {
	someDynamic = 'some component dynamic prop';

	onInit() {
		this.$emit('some-event', { success: true });
	}
}
