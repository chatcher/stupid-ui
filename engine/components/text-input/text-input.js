import { StupidBaseComponent } from '../stupid-base-component.js';

export class TextInputController extends StupidBaseComponent {
	errorSlot = null;

	error = null;
	required = false;
	touched = false;

	get input() {
		return this.$element.querySelector('input');
	}

	$validate() {
		this.error = null;
	  this.input.setCustomValidity('');
	  this.input.checkValidity();
	}

	onInit() {
		this.errorSlot = this.$element.querySelector('.errors');
	}

	onInput(event) {
		if (this.error) {
			this.$validate();
		}
	}

	onChange(event) {
		console.log('change event', event);
	}

	onFocus() {
		console.log('focus event', event);
	}

	onBlur() {
		this.$validate();
	}

	onError(type, event) {
		const input = event.target;
		const value = input.value;
		if(value.length) {
	    input.setCustomValidity('Things have to be like something!');
	  } else if (this.required) {
	    input.setCustomValidity('Enter a thing!');
	  }
	  const message = input.validationMessage;
	  this.error = message;
	}
}
