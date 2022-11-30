const url = new URL('http://example.com?q=x');

const query = {a:1,e:'2 + 2 = 5'}

Object.entries(query).forEach(([key, value]) => {
	url.searchParams.append(key, value);
})

const response = url.toString();
const expected = 'http://example.com/?q=x&a=1&e=2+%2B+2+%3D+5';

// console.log(url);
console.log(response);
console.log(expected);
console.log(response === expected ? 'pass' : 'fail');

// function transformExpression(expression) {
// 	const parts = expression.split(/(?<!\|)\|(?!\|)/);
// 	return parts.reduce((invocation, part, index) => {
// 		if (!index) {
// 			return part.trim();
// 		}

// 		const methodArgs = part.trim().split(/\s+/);
// 		const method = methodArgs.shift();
// 		methodArgs.unshift(invocation);

// 		return index ? `${method}Pipe(${methodArgs.join(', ')})` : part
// 	}, '');
// }

// function getTemplateValueMethod(element, expression) {
// 	const { controller } = element;
// 	const properties = controller.$watchableProperties || Reflect.ownKeys(controller);

// 	// eslint-disable-next-line no-new-func
// 	// const methodFactory = new Function(
// 	return `
// 		return async ({
// 			${properties.join(',')}
// 		}) => {
// 			try {
// 				return await (${expression});
// 			} catch (error) {
// 				console.error(error);
// 			}
// 		}
// 	`
// 	// );
// 	// const method = methodFactory();

// 	// return () => method(controller);
// }

// const jsonPipe = (value) => JSON.stringify(value);

// const rawExpression = "wrongThing || someData";

// const expression = transformExpression(rawExpression);
// console.log(expression);

// const someData = { prop: [1, 2] };
// const element = { controller: { someData } };
// const expected = JSON.stringify(someData);

// // const methodBody = getTemplateValueMethod(element, expression);
// // console.log(methodBody);

