class StupidBaseComponent {
	onInit() {}

	constructor(element) {
		this.$element = element;

		// const props = Object.keys(this);
		// console.log('StupidBaseComponent', { props });
		// Object.keys(this).forEach((key) => {
		// 	console.log(key);
		// });
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
		// this.element.dispatchEvent(new Event('some-event', { bubbles: true }));
	}
}
