'use strict';
let validate = require('is-express-schema-valid').default;

let schema = {
	payload: {
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
		},
		tags: {
			type: 'array',
			required: true,
			uniqueItems: true,
			items: {
				type: 'string',
				maxLength: 25
			}
		}
	}
};

module.exports = validate(schema);