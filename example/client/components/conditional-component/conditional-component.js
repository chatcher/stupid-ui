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

export class ConditionalComponentController extends StupidBaseComponent {
	constructor(element) {
		super(element);
	}

	value = 0;

	onInit() {
		const interval = setInterval(() => {
			this.value ++;
		}, 333);
		setTimeout(() => {
			clearInterval(interval);
			this.value = 0;
		}, 10000);
	}
}
