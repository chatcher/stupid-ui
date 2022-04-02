// const express = require('express');

// router = express.Router();

// router.all('/tasks', (req, res) => {
// 	res.status(203).json({
// 		tasks: true,
// 	});
// });

// module.exports = router;


module.exports = {
	get: () => [
		{ taskId: 1, taskName: 'first' },
		{ taskId: 2, taskName: 'second' },
		{ taskId: 3, taskName: 'third' },
	],
	// get: ({
	// 	params,
	// 	query,
	// } = {}) => ({
	// 	get: 'tasks',
	// 	params,
	// 	query,
	// }),
	post: ({
		params,
		query,
		body,
	} = {}) => ({
		post: 'tasks',
		params,
		query,
		body,
	}),
	// put: {}
	// patch: {}
	// delete: {}
}
