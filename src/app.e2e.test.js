'use strict';
let expect = require('chai').expect;
let db = require('./db');
let app = require('./app');
let request = require('supertest-as-promised');

describe('App', () => {
	beforeEach(() => {
		return db.removeAsync({}, {multi: true});
	});

	describe('POST /tags', () => {
		function postEntity(entity) {
			return request(app).post('/tags').send(entity);
		}

		it('should accept a valid entity', () => {
			return postEntity({
				identifier: '1234',
				entityType: 'type',
				tags: ['tag1', 'tag2']
			})
					.expect('Content-Type', /text/)
					.expect(200, 'entity saved');
		});

		it('should save a new entity', () => {
			return postEntity({
				identifier: '1234',
				entityType: 'type',
				tags: ['tag1', 'tag2']
			}).then(() => {
				return db.findAsync({
					identifier: '1234',
					entityType: 'type'
				});
			}).then((docs) => {
				expect(docs.length).to.equal(1);
				expect(docs[0].identifier).to.equal('1234');
				expect(docs[0].entityType).to.equal('type');
				let tags = docs[0].tags;
				expect(tags.length).to.equal(2);
				expect(tags[0]).to.equal('tag1');
				expect(tags[1]).to.equal('tag2');
			});
		});

		it('should overwrite existing entities', () => {
			return db.insertAsync({
				identifier: '1234',
				entityType: 'type',
				tags: ['tag1', 'tag2']
			}).then(() => {
				return postEntity({
					identifier: '1234',
					entityType: 'type',
					tags: ['tag3']
				});
			}).then(() => {
				return db.findAsync({
					identifier: '1234',
					entityType: 'type'
				});
			}).then((docs) => {
				expect(docs.length).to.equal(1);
				expect(docs[0].identifier).to.equal('1234');
				expect(docs[0].entityType).to.equal('type');
				let tags = docs[0].tags;
				expect(tags.length).to.equal(1);
				expect(tags[0]).to.equal('tag3');
			});
		});

		it('should reject an invalid entity', () => {
			return postEntity({
				entityType: 'type',
				tags: ['tag1', 'tag2']
			}).expect(500, '{"payload":[{"key":"identifier","message":"is required"}]}');
		});
	});

	describe('GET /tags/:entityType/:identifier', () => {
		it('should return a 500 if params invalid', () => {
			return request(app)
					.get('/tags/7/id')
					.expect(500, '{"params":[{"key":"entityType","message":"must be alpha format"}]}');
		});

		it('should return a 404 if no such entity exists', () => {
			return request(app)
					.get('/tags/bogus/morebogus')
					.expect(404, 'No such entity');
		});

		it('should return the entity if it exists', () => {
			return db.insertAsync({
				identifier: 'id',
				entityType: 'type',
				tags: ['tag1', 'tag2']
			}).then(() => {
				return request(app)
						.get('/tags/type/id')
						.expect(200, '{"identifier":"id","entityType":"type","tags":["tag1","tag2"]}');

			});
		});
	});

	describe('DELETE /tags/:entityType/:identifier', () => {
		it('should return a 500 if params invalid', () => {
			return request(app)
					.delete('/tags/7/id')
					.expect(500, '{"params":[{"key":"entityType","message":"must be alpha format"}]}');
		});

		it('should return a 404 if no such entity exists', () => {
			return request(app)
					.delete('/tags/bogus/morebogus')
					.expect(404, 'No such entity');
		});

		it('should delete the entity if it exists', () => {
			return db.insertAsync({
				identifier: 'id',
				entityType: 'type',
				tags: ['tag1', 'tag2']
			}).then(() => {
				return request(app)
						.delete('/tags/type/id')
						.expect(200, 'removed entity');

			}).then(() => {
				return db.findAsync(({identifier: 'id'}));
			}).then((docs) => expect(docs.length).to.equal(0));
		});
	});

	describe('GET /stats', () => {
		it('should return empty array if there are no entities', () => {
			return request(app)
					.get('/stats')
					.expect('Content-Type', /json/)
					.expect(200, '[]');
		});

		it('should return stats for each tag', () => {
			return db.insertAsync({
				identifier: 'id1',
				entityType: 'type1',
				tags: ['tag1', 'tag2']
			}).then(() => {
				return db.insertAsync({
					identifier: 'id2',
					entityType: 'type2',
					tags: ['tag1', 'tag3']
				});
			}).then(() => {
				return request(app)
						.get('/stats')
						.expect('Content-Type', /json/)
						.expect(200, '[{"tag":"tag1","count":2},{"tag":"tag2","count":1},{"tag":"tag3","count":1}]');
			});
		});
	});

	describe('GET /stats/:entityType/:identifier', () => {
		it('should return a 500 if params invalid', () => {
			return request(app)
					.get('/stats/7/id')
					.expect(500, '{"params":[{"key":"entityType","message":"must be alpha format"}]}');
		});

		it('should return a 404 if no such entity exists', () => {
			return request(app)
					.get('/stats/bogus/morebogus')
					.expect(404, 'No such entity');
		});

		it('should return the stats for the entity', () => {
			return db.insertAsync({
				identifier: 'id1',
				entityType: 'type',
				tags: ['tag1', 'tag2']
			}).then(() => {
				return db.insertAsync({
					identifier: 'id2',
					entityType: 'type',
					tags: ['tag1', 'tag3']
				});
			}).then(() => {
				return request(app)
						.get('/stats/type/id2')
						.expect(200, '{"entityType":"type","identifier":"id2","totalTags":2,"numSimilarEntities":1}');

			});
		});
	});
});