export function getTemplateValueMethod(element, expression, callback) {
	const { controller } = element;
	const properties = Object.keys(controller)
		.filter((property) => /^[a-z]/.test(property));
	const watchedProps = [];
	const handler = {
		get: (self, prop) => {
			if (callback && !watchedProps.includes(prop)) {
				controller.$watch(prop, callback);
				watchedProps.push(prop);
			}

			return Reflect.get(self, prop);
		},
	};
	const proxy = new Proxy(controller, handler);

	const methodFactory = new Function(`return ({${properties.join(',')}}) => (${expression});`);
	const method = methodFactory();

	return () => method(proxy);
}

export function getTemplateEventMethod(element, expression) {
	const { controller } = element;
	if (typeof controller[expression] === 'function') {
		return (payload) => controller[expression](payload);
	}

	const controllerProxy = new Proxy(controller, {
		get: (self, prop) => {
			const value = Reflect.get(self, prop);
			return typeof value === 'function'
				? value.bind(self)
				: value;
		},
	});
	const properties = Reflect.ownKeys(Reflect.getPrototypeOf(controller))
		.filter((name) => /^[a-z]/.test(name) && name !== 'constructor');

	const methodFactory = new Function(`return ({${properties.join(',')}}, $event) => (${expression});`);
	const method = methodFactory();

	return (payload) => method(controllerProxy, payload);
}
