const pipes = {
  jsonPipe: (value) => JSON.stringify(value, null, 2),
}

function transformExpression(expression) {
	const parts = expression.split(/(?<!\|)\|(?!\|)/);
	return parts.reduce((invocation, part, index) => {
		if (!index) {
			return part.trim();
		}

		const methodArgs = part.trim().split(/\s+/);
		const method = methodArgs.shift();
		methodArgs.unshift(invocation);

		return index ? `pipes.${method}Pipe(${methodArgs.join(', ')})` : part;
	}, '');
}

export function checkTemplateExpression(element, expression) {
	const { controller } = element;
	const properties = controller.$watchableProperties || Reflect.ownKeys(controller);
	const methodFactory = new Function(`
		return ({
			${properties.join(',')}
		}) => ${expression.replace(/(?<!\|)\|(?!\|).*/, '')}
	`);
	const method = methodFactory();

	try {
		const response = method(controller);
		console.log('response', response);
		return true;
	} catch (error) {
		console.warn('error', error);
		return false;
	}
}

export function getTemplateValueMethod(element, expression, callback) {
	const { controller } = element;
	const properties = controller.$watchableProperties || Reflect.ownKeys(controller);
	const watchedProps = [];
	const handler = {
		get: (self, prop) => {
			if (callback && !watchedProps.includes(prop)) {
				watchedProps.push(prop);
				if (Object.hasOwn(self, prop) && Object.hasOwn(controller, '$watch')) {
					controller.$watch(prop, callback);
				}
			}

			return Reflect.get(self, prop);
		},
	};
	const proxy = new Proxy(controller, handler);

	// eslint-disable-next-line no-new-func
	const methodFactory = new Function(`
		return async ({
			${properties.join(',')},
		}, pipes) => {
			try {
				return await (${transformExpression(expression)});
			} catch (error) {
				console.error(error);
			}
		}
	`);
	const method = methodFactory();

	return () => method(proxy, pipes);
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

	// eslint-disable-next-line no-new-func
	const methodFactory = new Function(`
		return ({
			${properties.join(',')}
		}, pipes, $event) => (${transformExpression(expression)});`);
	const method = methodFactory();

	return (payload) => method(controllerProxy, pipes, payload);
}
