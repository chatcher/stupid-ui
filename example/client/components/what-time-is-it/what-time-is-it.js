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
	data = [];

	get hour() {
		return this.data[0];
	}

	get minute() {
		return this.data[1];
	}

	get second() {
		return this.data[2];
	}

	get ms() {
		return this.data[3];
	}

	onInit() {
		const interval = setInterval(() => {
			this.boop();
		}, 333);
		setTimeout(() => {
			clearInterval(interval);
			this.bye();
		}, 10000);
	}

	boop() {
		const date = new Date()
		this.data = [
			date.getHours(),
			date.getMinutes(),
			date.getSeconds(),
			date.getMilliseconds(),
		];
	}

	bye() {
		this.data = 'Done'.split('');
	}
}
