'use strict';
let _ = require('lodash');

class EntityService {
	constructor(datastore) {
		this.datastore = datastore;
	}

	saveEntity(entity) {
		return this.deleteEntity(entity.entityType, entity.identifier)
				.then(() => this.datastore.insertAsync(entity));
	}

	deleteEntity(entityType, identifier) {
		return this.datastore.removeAsync({entityType: entityType, identifier: identifier});
	}

	getEntity(entityType, identifier) {
		return this.datastore.findOneAsync({entityType: entityType, identifier: identifier})
				.then((entityFromStore) => {
					if (!entityFromStore) {
						return null;
					}

					return _.pick(entityFromStore, ['identifier', 'entityType', 'tags']);
				});
	}
}

module.exports = EntityService;