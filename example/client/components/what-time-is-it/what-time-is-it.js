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

export class WhatTimeIsItController extends StupidBaseComponent {
	now = 'loading...';

	onInit() {
		const interval = setInterval(() => {
			this.now = new Date().toISOString();
		}, 333);
		setTimeout(() => {
			clearInterval(interval);
			this.now = 'Done';
		}, 5000);
	}
}
