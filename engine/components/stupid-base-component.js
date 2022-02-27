const isProxy = Symbol('is-proxy');

const handler = (callback) => ({
	get: (self, prop) => {
		const value = self[prop];
		if (value && typeof value === 'object' && !value[isProxy]) {
			self[prop] = wrap(self[prop]);
			return self[prop];
		}

		return self[prop];
	},
	set: (self, prop, value) => {
		self[prop] = value;
		callback();
		return true;
	},
});

function wrap(object, callback) {
	const valid = object && typeof object === 'object';
	return valid ? new Proxy(object, handler(callback)) : object;
}

export class StupidBaseComponent {
	onInit() {
		// console.log('StupidBaseComponent::onInit()');
	}

	constructor(element, router, services) {
		this.$element = element;
		this.$router = router;
		this.$services = services;
	}

	get $watchableProperties() {
		const proto = Reflect.getPrototypeOf(this);
		const superProto = Reflect.getPrototypeOf(proto);
		const superProtoKeys = Reflect.ownKeys(superProto);
		const keys = [
			...Reflect.ownKeys(proto),
			...Reflect.ownKeys(this),
		].filter((key, index, array) => (
			index === array.indexOf(key) &&
			!superProtoKeys.includes(key) &&
			/^[a-z]/.test(key)
		));
		return keys;
	}

	$watchers = {}; // { <propName>: [callback] }
	$watch(name, callback) {
		if (!this.$watchers[name]) {
			let _value = wrap(this[name], () => {
				this.$emitWatchers(name);
			});
			Object.defineProperty(this, name, {
				get: () => _value,
				set: (value) => {
					_value = wrap(value, () => {
						this.$emitWatchers(name);
					});
					this.$emitWatchers(name);
				},
			});
			this.$watchers[name] = [];
		}

		this.$watchers[name].push(callback);
		return () => {
			const index = this.$watchers[name].indexOf(callback);
			console.assert(index >= 0, `Uh, so this is kinda weird. Someone call an unwatch handler for ${name}, but I couldn't find the original callback in the array.`);
			this.$watchers[name].splice(index, 1);
		};
	}

	$timeouts = {};
	$emitWatchers(name) {
		clearTimeout(this.$timeouts[name]);
		this.$timeouts[name] = setTimeout(() => {
			this.$watchers[name].forEach((callback) => callback(this[name]));
		});
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
