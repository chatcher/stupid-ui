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

export class FancyValueController extends StupidBaseComponent {
	value = 'none (broken)';
}
