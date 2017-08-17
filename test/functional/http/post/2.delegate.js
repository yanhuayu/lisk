'use strict';

var node = require('../../../node');
var shared = require('./shared');
var constants = require('../../../../helpers/constants');

var sendTransaction = require('../../../common/complexTransactions').sendTransaction;
var sendLISK = require('../../../common/complexTransactions').sendLISK;

describe('POST /api/transactions (type 2)', function () {

	var badTransactions = [];
	var goodTransactions = [];
	var badTransactionsEnforcement = [];
	var goodTransactionsEnforcement = [];

	var account = node.randomAccount();
	var accountNoFunds = node.randomAccount();
	var accountScarceFunds = node.randomAccount();

	var transaction;

	// Crediting account
	before(function (done) {
		sendLISK({
			secret: node.gAccount.password,
			amount: 100000000000,
			address: account.address
		}, function (err, res) {
			node.expect(res).to.have.property('success').to.be.ok;
			node.expect(res).to.have.property('transactionId').that.is.not.empty;
			sendLISK({
				secret: node.gAccount.password,
				amount: constants.fees.delegate,
				address: accountScarceFunds.address
			}, function (err, res) {
				node.expect(res).to.have.property('success').to.be.ok;
				node.expect(res).to.have.property('transactionId').that.is.not.empty;
				node.onNewBlock(done);
			});
		});
	});

	describe('schema validations', function () {

		shared.invalidAssets(account, 'delegate', badTransactions);

		// TODO: lisk-js adds publicKey #296
		// describe('using invalid asset.delegate.publicKey values', function () {
		//
		// 	shared.tests.forEach(function (test) {
		// 		it('using ' + test.describe + ' should fail', function (done) {
		// 			transaction.asset.delegate.publicKey = test.args;
		//
		// 			// TODO: to find out why
		// 			if(test.describe === 'empty string'){
		// 				// sendTransaction(transaction, function (err, res) {
		// 				// 	node.expect(res).to.have.property('success').to.be.ok;
		// 				// 	node.expect(res).to.have.property('transactionId').to.equal(transaction.id);
		// 				// 	badTransactions.push(transaction);
		// 				done();
		// 				// }, true);
		// 			} else {
		// 				sendTransaction(transaction, function (err, res) {
		// 					node.expect(res).to.have.property('success').to.be.not.ok;
		// 					node.expect(res).to.have.property('message');
		// 					badTransactions.push(transaction);
		// 					done();
		// 				}, true);
		// 			}
		// 		});
		// 	});
		// });
	});

	describe('transactions processing', function () {

		it('setting delegate with no funds should fail', function (done) {
			accountNoFunds = node.randomAccount();
			transaction = node.lisk.delegate.createDelegate(accountNoFunds.password, accountNoFunds.username);

			sendTransaction(transaction, function (err, res) {
				node.expect(res).to.have.property('success').to.not.be.ok;
				node.expect(res).to.have.property('message').to.equal('Account does not have enough LSK: ' + accountNoFunds.address + ' balance: 0');
				badTransactions.push(transaction);
				done();
			}, true);
		});

		it('setting second secret with exact funds should be ok', function (done) {
			transaction = node.lisk.delegate.createDelegate(accountScarceFunds.password, accountScarceFunds.username);

			sendTransaction(transaction, function (err, res) {
				node.expect(res).to.have.property('success').to.be.ok;
				node.expect(res).to.have.property('transactionId').to.equal(transaction.id);
				goodTransactions.push(transaction);
				done();
			}, true);
		});

		it('setting delegate with good schema transaction should be ok', function (done) {
			transaction = node.lisk.delegate.createDelegate(account.password, account.username);
			sendTransaction(transaction, function (err, res) {
				node.expect(res).to.have.property('success').to.be.ok;
				node.expect(res).to.have.property('transactionId').to.equal(transaction.id);
				goodTransactions.push(transaction);
				done();
			}, true);
		});

		// TODO: bug #729
		// it('setting delegate twice with good schema transaction should be ok', function (done) {
		// 	transaction = node.lisk.delegate.createDelegate(account.password, node.randomDelegateName());
		// 	sendTransaction(transaction, function (err, res) {
		// 		node.expect(res).to.have.property('success').to.be.ok;
		// 		node.expect(res).to.have.property('transactionId').to.equal(transaction.id);
		// 		goodTransactions.push(transaction);
		// 		done();
		// 	}, true);
		// });
	});

	describe('transactions confirmation', function () {

		shared.confirmationPhase(goodTransactions, badTransactions);
	});

	describe('enforcement', function () {

		it('setting same delegate twice should fail', function (done) {
			transaction = node.lisk.delegate.createDelegate(account.password, account.username);

			sendTransaction(transaction, function (err, res) {
				node.expect(res).to.have.property('success').to.not.be.ok;
				node.expect(res).to.have.property('message').to.equal('Account is already a delegate');
				badTransactionsEnforcement.push(transaction);
				done();
			}, true);
		});

		it('updating registered delegate should fail', function (done) {
			transaction = node.lisk.delegate.createDelegate(account.password, 'new username');

			sendTransaction(transaction, function (err, res) {
				node.expect(res).to.have.property('success').to.not.be.ok;
				node.expect(res).to.have.property('message').to.equal('Account is already a delegate');
				badTransactionsEnforcement.push(transaction);
				done();
			}, true);
		});
	});

	describe('enforcement confirmation', function () {

		shared.confirmationPhase(goodTransactionsEnforcement, badTransactionsEnforcement);
	});
});
