'use strict';
let bluebird = require('bluebird');
let bodyParser = require('body-parser');
let express = require('express');
let SchemaValidationError = require('is-express-schema-valid').default.SchemaValidationError;
let db = require('./db');

let newEntityValidator = require('./validators/newEntityValidator');
let entityRefValidator = require('./validators/entityRefValidator');

let EntityService = require('./services/entityService/EntityService');
let entityService = new EntityService(db);

let StatService = require('./services/statService/StatService');
let statService = new StatService(db);
let getEntityMiddleware = require('./middlewares/getEntity')(entityService);

let app = express();
app.use(bodyParser.json());

app.post('/tags', newEntityValidator, (req, res, next) => {
	entityService.saveEntity(req.body).then(() => res.send('entity saved')).catch(next);
});

app.route('/tags/:entityType/:identifier')
		.all(entityRefValidator, getEntityMiddleware)
		.get((req, res, next) => res.json(req.entity))
		.delete((req, res, next) => {
			entityService.deleteEntity(req.entity.entityType, req.entity.identifier)
					.then(() => res.send('removed entity')).catch(next);
		});

app.get('/stats', (req, res, next) => {
	statService.getAllTags().then((tags) => {
		let statsPromises = tags.map((tag) => statService.getStatsForTag(tag));
		return Promise.all(statsPromises);
	}).then((stats) => res.json(stats)).catch(next);
});

app.route('/stats/:entityType/:identifier').all(entityRefValidator, getEntityMiddleware, (req, res, next) => {
	statService.getStatsForEntity(req.entity).then((stats) => {
		if (!stats) {
			let error = new Error('Could not retrieve stats for entity');
			return next(error);
		}
		req.entityStats = stats;
		next();
	}).catch(next);
}).get((req, res, next) => res.json(req.entityStats));

app.use((err, req, res, next) => {
	if (err instanceof SchemaValidationError) {
		res.status(500);
		return res.json(err.errors);
	}

	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.send(err.message);
});

module.exports = app;