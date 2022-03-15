import { StupidBaseComponent } from '../stupid-base-component.js';

export class TextInputController extends StupidBaseComponent {
	errorSlot = null;

	error = null;
	touched = false;

	get input() {
		return this.$element.querySelector('input');
	}

	validate() {
		this.error = null;
	  this.input.setCustomValidity('');
	  this.input.checkValidity();
	}

	onInit() {
		this.errorSlot = this.$element.querySelector('.errors');
	}

	onInput(event) {
		console.log('input event', event);
		if (this.error) {
			validate();
		}
	}

	onChange(event) {
		console.log('change event', event);
	}

	onFocus() {
		console.log('focus event', event);
	}

	onBlur() {
		console.log('blur event', event);
		console.log('this.input', this.input);
		this.validate();
	}

	onError(type, event) {
		event.stopPropagation();
		event.preventDefault();
		const input = event.target;
		const value = input.value;
		console.log('input error happen');
		console.log('type', type);
		console.log('value:', value);
	  if(value === '') {
	    input.setCustomValidity('Enter a thing!');
	  } else {
	    input.setCustomValidity('Things have to be like something!');
	  }
	  const message = input.validationMessage;
	  this.error = message;
	}
}
