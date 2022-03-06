module.exports = function (plop) {
	plop.setGenerator('engine-component', {
		description: 'create a new engine component',
		prompts: [{
			type: 'input',
			name: 'name',
			message: 'name',
		}, {
			type: 'confirm',
			name: 'hasTemplate',
			message: 'has template?',
		}],
		actions: [{
			// add controller
			type: 'add',
			path: 'engine/components/{{ dashCase name }}/{{ dashCase name }}.js',
			templateFile: 'plop/engine/component/controller.js',
			force: true, // TODO: remove
		}, {
			// add template
			type: 'add',
			skip: (data) => !data.hasTemplate && 'no template',
			path: 'engine/components/{{ dashCase name }}/{{ dashCase name }}.html',
			templateFile: 'plop/engine/component/template.html',
			force: true, // TODO: remove
		}, {
			// update components file
			type: 'modify',
			skip: (data) => !data.hasTemplate && 'no template',
			path: 'engine/components/components.js',
			pattern: 'export const components = {',
			template: `export const components = {\n\t"{{ dashCase name }}": ${
				JSON.stringify({
					name: '{{ dashCase name }}',
					controller: '/engine/components/{{ dashCase name }}/{{ dashCase name }}.js',
					template: '/engine/components/{{ dashCase name }}/{{ dashCase name }}.html',
					files: [
						'/engine/components/{{ dashCase name }}/{{ dashCase name }}.js',
						'/engine/components/{{ dashCase name }}/{{ dashCase name }}.html',
					],
				}, null, '\t')
					.replace(/\n/g, '\n\t')
			},`,
		}, {
			// update components file
			type: 'modify',
			skip: (data) => data.hasTemplate && 'template',
			path: 'engine/components/components.js',
			pattern: 'export const components = {',
			template: `export const components = {\n\t"{{ dashCase name }}": ${
				JSON.stringify({
					name: '{{ dashCase name }}',
					controller: '/engine/components/{{ dashCase name }}/{{ dashCase name }}.js',
					files: [
						'/engine/components/{{ dashCase name }}/{{ dashCase name }}.js',
					],
				}, null, '\t')
					.replace(/\n/g, '\n\t')
			},`,
		}],
	});
};
