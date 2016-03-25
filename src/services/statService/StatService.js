'use strict';
let _ = require('lodash');

class StatService {
	constructor(datastore) {
		this.datastore = datastore;
	}

	getAllTags() {
		return this.datastore.findAsync({}, {tags: 1})
				.then((docs) => _(docs).map('tags').flatMap().uniq().sortBy().value());
	}

	getStatsForTag(tag) {
		return this.datastore.countAsync({tags: tag}).then((count) => {
			return {tag: tag, count: count};
		});
	}

	getStatsForEntity(entity) {
		return this.datastore.countAsync({tags: {$in: entity.tags}}).then((count) => {
			let numSimilar = count ? count - 1 : 0;
			return {
				entityType: entity.entityType,
				identifier: entity.identifier,
				totalTags: entity.tags.length,
				numSimilarEntities: numSimilar
			};
		});
	}
}

module.exports = StatService;