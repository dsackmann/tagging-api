'use strict';
let expect = require('chai').expect;
let sinon = require('sinon');
let EntityService = require('./EntityService');

describe('EntityService', () => {
	let service, mockDatastore;

	beforeEach(() => {
		mockDatastore = {
			insertAsync: sinon.stub().returns(Promise.resolve()),
			removeAsync: sinon.stub().returns(Promise.resolve()),
			findOneAsync: sinon.stub().returns(Promise.resolve())
		};
		service = new EntityService(mockDatastore);
	});

	describe('saveEntity', () => {
		it('should save a new entity', () => {
			let entity = {foo: 'bar'};
			return service.saveEntity(entity).then(() => {
				expect(mockDatastore.insertAsync.calledOnce).to.be.true;
				expect(mockDatastore.insertAsync.firstCall.args[0]).to.equal(entity);
			});
		});

		it('should delete any existing entity with the same type and id', () => {
			let entity = {identifier: 'id', entityType: 'type', tags: ['a', 'b']};
			return service.saveEntity(entity).then(() => {
				expect(mockDatastore.removeAsync.calledOnce).to.be.true;
				let removeArg = mockDatastore.removeAsync.firstCall.args[0];
				expect(Object.keys(removeArg).length).to.equal(2);
				expect(removeArg.identifier).to.equal('id');
				expect(removeArg.entityType).to.equal('type');
			});
		});
	});

	describe('deleteEntity', () => {
		it('should remove the entity', () => {
			return service.deleteEntity('type', 'id').then(() => {
				expect(mockDatastore.removeAsync.calledOnce).to.be.true;
				let removeArg = mockDatastore.removeAsync.firstCall.args[0];
				expect(Object.keys(removeArg).length).to.equal(2);
				expect(removeArg.identifier).to.equal('id');
				expect(removeArg.entityType).to.equal('type');
			});
		})
	});

	describe('getEntity', () => {
		beforeEach(() => {
			mockDatastore.findOneAsync = sinon.stub().returns(Promise.resolve({
				identifier: 'id',
				entityType: 'type',
				tags: ['tag1', 'tag2'],
				_id: 'abc123'
			}));
		});

		it('should query for the entity', () => {
			return service.getEntity('type', 'id').then(() => {
				expect(mockDatastore.findOneAsync.calledOnce).to.be.true;
				let findOneArg = mockDatastore.findOneAsync.firstCall.args[0];
				expect(Object.keys(findOneArg).length).to.equal(2);
				expect(findOneArg.identifier).to.equal('id');
				expect(findOneArg.entityType).to.equal('type');
			});
		});

		it('should return the entity', () => {
			return service.getEntity('type', 'id').then((entity) => {
				expect(entity.entityType).to.equal('type');
				expect(entity.identifier).to.equal('id');
				let tags = entity.tags;
				expect(tags.length).to.equal(2);
				expect(tags[0]).to.equal('tag1');
				expect(tags[1]).to.equal('tag2');
			});
		});

		it('should not include non-entity fields', () => {
			return service.getEntity('type', 'id').then((entity) => {
				expect(entity._id).to.equal(undefined);
			});
		});

		describe('when no entity exists', () => {
			beforeEach(() => {
				mockDatastore.findOneAsync = sinon.stub().returns(Promise.resolve())
			});

			it('should return null', () => {
				return service.getEntity('type', 'id').then((entity) => {
					expect(entity).to.equal(null);
				});
			});
		});
	});
});