'use strict';

function getGetEntityMiddleware(entityService) {
	return (req, res, next) => {
		entityService.getEntity(req.params.entityType, req.params.identifier).then((entity) => {
			if (!entity) {
				let error = new Error('No such entity');
				error.status = 404;
				return next(error);
			}
			req.entity = entity;
			next();
		}).catch(next);
	};
}

module.exports = getGetEntityMiddleware;