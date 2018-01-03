'use strict';

var sinon = require('sinon');
var SCWorker = require('socketcluster/scworker');
var SlaveWAMPServer = require('wamp-socket-cluster/SlaveWAMPServer');
var WAMPServer = require('wamp-socket-cluster/WAMPServer');
var testConfig = require('../../data/config.json');

var worker = SCWorker.create({
	run: function () {
		var worker = this;
		var scServer = this.getSCServer();

		var slaveWAMPServer = new SlaveWAMPServer(worker, 20e3);

		slaveWAMPServer.reassignRPCSlaveEndpoints({
			updateMyself: function (data, callback) {
				callback(null);
			}
		});

		scServer.on('connection', function (socket) {
			slaveWAMPServer.upgradeToWAMP(socket);
			socket.emit('accepted');
		});
	}
});
