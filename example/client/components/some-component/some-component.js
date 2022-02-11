import { StupidBaseComponent } from '/engine/components/stupid-base-component.js';

export class SomeComponentController extends StupidBaseComponent {
	someDynamic = 'some component dynamic prop';

	onInit() {
		setTimeout(() => {
			this.$emit('some-event', {
				success: true,
				message: 'hey, uh, events work.',
			});
		}, 1500);
	}
}
