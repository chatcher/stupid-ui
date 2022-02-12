import { services as projectServices } from '../services.js';

const serviceCache = {};
const promises = {};

async function importService(serviceName) {
	if (!promises[serviceName]) {
		// eslint-disable-next-line no-async-promise-executor
		promises[serviceName] = new Promise(async (resolve) => {
			const config = projectServices[serviceName];
			const serviceModule = await import(config.service);
			const service = new serviceModule[config.name](services);

			Reflect.set(serviceCache, serviceName, service);

			resolve(service);
		});
	}

	return promises[serviceName];
}

function loadServiceMethod(serviceName, methodName) {
	importService(serviceName);

	return async (...args) => {
		await promises[serviceName];
		return serviceCache[serviceName][methodName](...args);
	};
}

const serviceMethodHandler = {
	get(service, methodName) {
		if (!(methodName in service)) {
			service[methodName] = loadServiceMethod(service.$name, methodName);
		}

		return service[methodName];
	},
};

const serviceProxyHandler = {
	get(serviceCache, serviceName) {
		if (!(serviceName in serviceCache)) {
			serviceCache[serviceName] = new Proxy({
				$name: serviceName,
			}, serviceMethodHandler);
		}

		return serviceCache[serviceName];
	},
};

export const services = new Proxy(serviceCache, serviceProxyHandler);
