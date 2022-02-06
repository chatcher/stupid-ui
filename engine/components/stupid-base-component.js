export class StupidBaseComponent {
	onInit() {}

	constructor(element, template) {
		this.$element = element;

		if (template) {
			this.$template = template;
		}
	}

	$emit(name, payload) {
		const event = new Event(name, { bubbles: true });
		event.payload = payload;
		this.$element.dispatchEvent(event);
	}

	$on(name, callback) {
		this.$element.addEventListener(name, (event) => {
			event.stopPropagation();
			callback(event.payload);
		});
	}

	$detach() {
		if (!this.$socket) {
			this.$socket = document.createComment(this.$element.componentId);
		}

		this.$element.replaceWith(this.$socket);
	}

	$reattach() {
		this.$socket.replaceWith(this.$element);
	}
}
