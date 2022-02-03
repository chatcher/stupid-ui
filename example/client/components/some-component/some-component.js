class StupidBaseComponent {
	onInit() {}

	constructor(element) {
		this.$element = element;
	}

	$emit(name, payload) {
		const event = new Event(name, { bubbles: true });
		event.payload = payload;
		this.$element.dispatchEvent(event);
	}
}

export class SomeComponentController extends StupidBaseComponent {
	someDynamic = 'some component dynamic prop';

	constructor(element) {
		super(element);
	}

	onInit() {
		this.$emit('some-event', { success: true });
	}
}
