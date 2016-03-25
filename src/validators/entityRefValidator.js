'use strict';
let validate = require('is-express-schema-valid').default;

let schema = {
	params: {
		identifier: {
			type: 'string',
			required: true,
			maxLength: 256
		},
		entityType: {
			type: 'string',
			required: true,
			maxLength: 256,
			format: 'alpha'
		}
	}
};

module.exports = validate(schema);