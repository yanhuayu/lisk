'use strict';

var node = require('../../../node');

var getTransaction = require('../../../common/complexTransactions').getTransaction;
var getUnconfirmedTransaction = require('../../../common/complexTransactions').getUnconfirmedTransaction;

var getTransactionPromise = node.Promise.promisify(getTransaction);
var getUnconfirmedTransactionPromise = node.Promise.promisify(getUnconfirmedTransaction);

var sendTransaction = require('../../../common/complexTransactions').sendTransaction;

var sentences = {
	emptyTx : 									'Invalid transaction body - Empty trs passed',
	unknownTx : 								'Invalid transaction body - Unknown transaction type ',
	failedId : 									'Failed to get transaction id',
	invalidId:									'Invalid transaction id'
};

var tests = [
	{describe: 'null',							args: null},
	{describe: 'undefined',					args: undefined},
	{describe: 'NaN',								args: NaN},
	{describe: 'Infinity',					args: Infinity},
	{describe: '0 integer',					args: 0},
	{describe: 'negative integer',	args: -1},
	{describe: 'float',							args: 1.2},
	{describe: 'negative float',		args: -1.2},
	{describe: 'empty string',			args: ''},
	{describe: '0 as string',				args: '0'},
	{describe: 'regular string',		args: String('abc')},
	{describe: 'uppercase string',	args: String('ABC')},
	{describe: 'invalid chars',			args: String('/@')},
	{describe: 'date',							args: new Date()},
	{describe: 'true boolean',			args: true},
	{describe: 'false boolean',			args: false},
	{describe: 'empty array',				args: []},
	{describe: 'empty object',			args: {}}
];

function confirmationPhase (goodTransactions, badTransactions){

	describe('before new block', function () {

		it('good transactions should remain unconfirmed', function () {
			return node.Promise.map(goodTransactions, function (tx) {
				return getTransactionPromise(tx.id).then(function (res) {
					node.expect(res).to.have.property('success').to.be.not.ok;
					node.expect(res).to.have.property('error').equal('Transaction not found');
				});
			});
		});
	});

	describe('after new block', function () {

		before(function (done) {
			node.onNewBlock(done);
		});

		it('bad transactions should not be confirmed', function () {
			return node.Promise.map(badTransactions, function (tx) {
				return getTransactionPromise(tx.id).then(function (res) {
					node.expect(res).to.have.property('success').to.be.not.ok;
					node.expect(res).to.have.property('error').equal('Transaction not found');
				});
			});
		});

		it('good transactions should not be unconfirmed', function () {
			return node.Promise.map(goodTransactions, function (tx) {
				return getUnconfirmedTransactionPromise(tx.id).then(function (res) {
					node.expect(res).to.have.property('success').to.be.not.ok;
					node.expect(res).to.have.property('error').equal('Transaction not found');
				});
			});
		});

		it('good transactions should be confirmed', function () {
			return node.Promise.map(goodTransactions, function (tx) {
				return getTransactionPromise(tx.id).then(function (res) {
					node.expect(res).to.have.property('success').to.be.ok;
					node.expect(res).to.have.property('transaction').to.have.property('id').equal(tx.id);
				});
			});
		});
	});
};

function invalidTxs (){

	// var tests = [
	// 	{describe: 'null',							args: null,						expected: sentences.emptyTx},
	// 	{describe: 'undefined',					args: undefined,			expected: sentences.emptyTx},
	// 	{describe: 'NaN',								args: NaN,						expected: sentences.emptyTx},
	// 	{describe: 'Infinity',					args: Infinity,				expected: sentences.emptyTx},
	// 	{describe: '0 integer',					args: 0,							expected: sentences.emptyTx},
	// 	{describe: 'negative integer',	args: -1,							expected: sentences.emptyTx},
	// 	{describe: 'float',							args: 1.2,						expected: sentences.emptyTx},
	// 	{describe: 'negative float',		args: -1.2,						expected: sentences.emptyTx},
	// 	{describe: 'empty string',			args: '',							expected: sentences.emptyTx},
	// {describe: '0 as string',				args: '0',						expected: sentences.unknownTx + 'undefined'},
	// {describe: 'regular string',		args: String('abc'),	expected: sentences.unknownTx + 'undefined'},
	// {describe: 'date',							args: new Date(),			expected: sentences.unknownTx + 'undefined'},
	// 	{describe: 'true boolean',			args: true,						expected: sentences.emptyTx},
	// 	{describe: 'false boolean',			args: false,					expected: sentences.emptyTx},
	// 	{describe: 'empty array',				args: [],							expected: sentences.emptyTx},
	// 	{describe: 'empty object',			args: {},							expected: sentences.emptyTx}
	// ];

	tests.forEach(function (test) {
		it('using ' + test.describe + ' should fail', function (done) {
			sendTransaction(test.args, function (err, res) {
				node.expect(res).to.have.property('success').to.not.be.ok;
				node.expect(res).to.have.property('message');
				done();
			}, true);
		});
	});
};

module.exports = {
	sentences: sentences,
	tests: tests,
	confirmationPhase: confirmationPhase,
	invalidTxs: invalidTxs
};
