'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
var Promise = require('bluebird');

module.exports = function (params) {

	describe('blocks', function () {

		var nodesTransactions = [];

		before(function () {
			return Promise.all(params.sockets.map(function (socket) {
				return socket.wampSend('blocks');
			})).then(function (results) {
				nodesTransactions = results.map(function (res) {
					return res.blocks;
				});
				expect(nodesTransactions).to.have.lengthOf(params.configurations.length);
			});
		});

		it('should contain non empty transactions after running functional tests', function () {
			nodesTransactions.forEach(function (transactions) {
				expect(transactions).to.be.an('array').and.not.empty;
			});
		});

		it('should have all peers having same amount of confirmed transactions', function () {
			var uniquePeersTransactionsNumber = _(nodesTransactions).map('length').uniq().value();
			expect(uniquePeersTransactionsNumber).to.have.lengthOf.at.least(1);
		});

		it('should have all transactions the same at all peers', function () {
			var patternTransactions = nodesTransactions[0];
			for (var i = 0; i < patternTransactions.length; i += 1) {
				for (var j = 1; j < nodesTransactions.length; j += 1) {
					expect(_.isEqual(nodesTransactions[j][i], patternTransactions[i]));
				}
			}
		});
	});
};
