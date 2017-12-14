'use strict';

var crypto = require('crypto');
var _ = require('lodash');

var BlockReward = require('../logic/blockReward.js');
var constants = require('../helpers/constants.js');

// Private fields
var modules;
var library;
var blockReward;
var loaded;

/**
 * Initializes library with scope content and private variables:
 * - library
 * - blockReward
 * @class
 * @classdesc Main System methods.
 * @param {setImmediateCallback} cb - Callback function.
 * @param {scope} scope - App instance.
 */
// Constructor
function Node (cb, scope) {
	library = {
		build: scope.build,
		lastCommit: scope.lastCommit,
		config: {
			version: scope.config.version,
			nethash: scope.config.nethash,
			nonce: scope.config.nonce,
			forging: {
				secret: scope.config.forging.secret
			}
		}
	};
	blockReward = new BlockReward();
	setImmediate(cb, null, this);
}

Node.prototype.internal = {
	/**
	 * Get the forging status of a delegate.
	 * @param {string} publicKey - Public key of delegate.
	 * @param {function} cb - Callback function.
	 * @returns {setImmediateCallbackObject}
	 */
	getForgingStatus: function (publicKey, cb) {
		var keyPairs = modules.delegates.getForgersKeyPairs();
		var internalForgers = library.config.forging.secret;

		var fullList = internalForgers.map(function (forger) {
			return {forging: !!forger.publicKey, publicKey: forger.publicKey};
		});

		if(publicKey && _.find(fullList, { publicKey: publicKey})) {
			return setImmediate(cb, null, [{publicKey: publicKey, forging: !!keyPairs[publicKey]}]);
		}

		if(publicKey && !_.find(fullList, { publicKey: publicKey})) {
			return setImmediate(cb, null, []);
		}

		return setImmediate(cb, null, fullList);
	},

	/**
	 * Toggle the forging status of a delegate.
	 * @param {string} publicKey - Public key of a delegate.
	 * @param {string} decryptionKey - Key used to decrypt encrypted passphrase.
	 * @param {function} cb - Callback function.
	 * @returns {setImmediateCallbackObject}
	 */
	toggleForgingStatus: function (publicKey, decryptionKey, cb) {
		modules.delegates.toggleForgingStatus(publicKey, decryptionKey, function (err, result) {
			if (err) { return setImmediate(cb, err); }

			return setImmediate(cb, null, result);
		});
	}
};

// Public methods
Node.prototype.shared = {
	getConstants: function (req, cb) {
		if (!loaded) {
			return setImmediate(cb, 'Blockchain is loading');
		}
		var height = modules.blocks.lastBlock.get().height;
		return setImmediate(cb, null, {
			build: library.build,
			commit: library.lastCommit,
			epoch: constants.epochTime,
			fees: constants.fees,
			nethash: library.config.nethash,
			nonce: library.config.nonce,
			milestone: blockReward.calcMilestone(height),
			reward: blockReward.calcReward(height),
			supply: blockReward.calcSupply(height),
			version: library.config.version
		});
	},

	getStatus: function (req, cb) {
		if (!loaded) {
			return setImmediate(cb, 'Blockchain is loading');
		}
		modules.loader.getNetwork(function (err, network) {
			network = network || {height: null};
			return setImmediate(cb, null, {
				broadhash: modules.system.getBroadhash(),
				consensus: modules.peers.getConsensus() || null,
				height: modules.blocks.lastBlock.get().height,
				loaded: modules.loader.loaded(),
				networkHeight: network.height,
				syncing: modules.loader.syncing()
			});
		});
	}
};

// Events
/**
 * Assigns used modules to modules variable.
 * @param {modules} scope - Loaded modules.
 */
Node.prototype.onBind = function (scope) {
	modules = {
		blocks: scope.blocks,
		loader: scope.loader,
		peers: scope.peers,
		system: scope.system,
		delegates: scope.delegates
	};
	loaded = true;
};

// Export
module.exports = Node;
