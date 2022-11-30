export class HttpService {
	async getResponse(resource, {
		query,
		headers : reqHeaders,
	} = {}) {
		console.log('$http.get', resource, query, reqHeaders);
		const url = new URL(resource);
		const method = 'GET';
		const headers = new Headers();

		if (query) Object.entries(query).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});

		if (reqHeaders) Object.entries(reqHeaders).forEach(([key, value ]) => {
			headers.append(key, value);
		});

		const response = await fetch(url, {
			method,
			headers,
			// mode: 'same-origin', 'cors', 'no-cors',
			// credentials: 'same-origin', 'include', 'omit',
			// cache: 'default', 'no-cache',
			// keepalive: true, false,
		});

		console.log(response);
		console.log(response.ok);
		console.log(response.status);

		return response;
	}

	async get(resource, params) {
		const response = this.getResponse(resource, params);

		try {
			return response.json();
		} catch (_) {
			return response.text();
		}
	}
}
