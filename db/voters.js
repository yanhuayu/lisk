'use strict';

var PQ = require('pg-promise').ParameterizedQuery;

function VotersRepo (db, pgp) {
	this.db = db;
	this.pgp = pgp;

	this.sortFields = [
		'username',
		'address',
		'publicKey'
	];
}

var Queries = {
	getVoters: new PQ('SELECT "accountId" FROM mem_accounts2delegates WHERE "dependentId" = $1 LIMIT $2 OFFSET $3'),

	getVotersCount: new PQ('SELECT COUNT("accountId") AS "votersCount" FROM mem_accounts2delegates WHERE "dependentId" = $1')
};

VotersRepo.prototype.list = function (params) {
	return this.db.query(Queries.getVoters, [params.publicKey, params.limit, params.offset]);
};

VotersRepo.prototype.count = function (publicKey) {
	return this.db.one(Queries.getVotersCount, [publicKey]).then(function (result) {
		return result.votersCount;
	});
};

module.exports = VotersRepo;
