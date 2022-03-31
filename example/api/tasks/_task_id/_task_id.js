// const express = require('express');

// router = express.Router();

// router.all('/:taskId', (req, res) => {
// 	res.status(203).json({
// 		tasks: true,
// 	});
// });

// module.exports = router;

module.exports = {
	get: ({
		params,
		query,
	} = {}) => ({
		get: 'task id',
		params,
		query,
	}),
	post: ({
		params,
		query,
		body,
	} = {}) => {
		if (body.e) {
			const error = new Error(body.e);
			if (body.s)
				error.status = body.s;
			throw error
		}
		return ({
			post: 'task id',
			params,
			query,
			body,
		});
	},
	// put: {}
	// patch: {}
	// delete: {}
}
