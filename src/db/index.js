'use strict';
let bluebird = require('bluebird');
let Datastore = require('nedb');

module.exports = bluebird.promisifyAll(new Datastore({
	autoload: true
}));