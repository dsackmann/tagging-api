'use strict';
let expect = require('chai').expect;
let sinon = require('sinon');
let StatService = require('./StatService');

describe('StatService', () => {
	let service, mockDatastore;

	beforeEach(() => {
		mockDatastore = {
			findAsync: sinon.stub().returns(Promise.resolve()),
			countAsync: sinon.stub().returns(Promise.resolve(2))
		};
		service = new StatService(mockDatastore);
	});

	describe('getAllTags', () => {
		describe('if there are no tags', () => {
			beforeEach(() => {
				mockDatastore.findAsync = sinon.stub().returns(Promise.resolve([]));
			});

			it('should return no tags', () => {
				return service.getAllTags().then((tags) => expect(tags.length).to.equal(0));
			});
		});

		describe('if there are tags', () => {
			beforeEach(() => {
				mockDatastore.findAsync = sinon.stub().returns(Promise.resolve([
					{tags: ['tag1', 'tag2']},
					{tags: ['tag3']}
				]));
			});

			it('should return the tags', () => {
				return service.getAllTags().then((tags) => {
					expect(tags.length).to.equal(3);
					expect(tags[0]).to.equal('tag1');
					expect(tags[1]).to.equal('tag2');
					expect(tags[2]).to.equal('tag3');
				});
			});
		});

		describe('if there are duplicate tags', () => {
			beforeEach(() => {
				mockDatastore.findAsync = sinon.stub().returns(Promise.resolve(Promise.resolve([
					{tags: ['tag1', 'tag2']},
					{tags: ['tag1']}
				])));
			});

			it('should return the distinct tags', () => {
				return service.getAllTags().then((tags) => {
					expect(tags.length).to.equal(2);
					expect(tags[0]).to.equal('tag1');
					expect(tags[1]).to.equal('tag2');
				});
			});
		});
	});

	describe('getStatsForTag', () => {
		it('should return the tag name', () => {
			return service.getStatsForTag('tag').then((stats) => expect(stats.tag).to.equal('tag'));
		});

		it('should return the count',() => {
			return service.getStatsForTag('tag').then((stats) => expect(stats.count).to.equal(2));
		});

		it('should query for the tag', () => {
			return service.getStatsForTag('tag').then(() => {
				expect(mockDatastore.countAsync.calledOnce).to.be.true;
				expect(mockDatastore.countAsync.firstCall.args[0].tags).to.equal('tag');
			});
		});
	});

	describe('getStatsForEntity', () => {
		let entity = {entityType: 'type', identifier: 'id', tags: ['a', 'b']};
		it('should return the entity type',() => {
			return service.getStatsForEntity(entity).then((stats) => expect(stats.entityType).to.equal('type'));
		});

		it('should return the entity identifier',() => {
			return service.getStatsForEntity(entity).then((stats) => expect(stats.identifier).to.equal('id'));
		});

		it('should return the number of tags',() => {
			return service.getStatsForEntity(entity).then((stats) => expect(stats.totalTags).to.equal(2));
		});

		describe('numSimilarEntities', () => {
			describe('if there are no similar entities', () => {
				beforeEach(() => mockDatastore.countAsync.returns(Promise.resolve(0)));

				it('should return 0', () => {
					return service.getStatsForEntity(entity).then((stats) => expect(stats.numSimilarEntities).to.equal(0));
				});
			});

			describe('if there is one similar entity', () => {
				beforeEach(() => mockDatastore.countAsync.returns(Promise.resolve(1)));

				it('should return 0', () => {
					return service.getStatsForEntity(entity).then((stats) => expect(stats.numSimilarEntities).to.equal(0));
				});
			});

			describe('if there are multiple similar entities', () => {
				beforeEach(() => mockDatastore.countAsync.returns(Promise.resolve(42)));

				it('should return the total minus one', () => {
					return service.getStatsForEntity(entity).then((stats) => expect(stats.numSimilarEntities).to.equal(41));
				});
			});
		});
	});
});