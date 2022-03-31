// const express = require('express');

// router = express.Router();

// router.all('/tasks', (req, res) => {
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
		get: 'tasks',
		params,
		query,
	}),
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
