var grunt = require('grunt');
var target = grunt.option('target') ? grunt.option('target').toUpperCase() : 'DEV';
var http = require('http');
var https = require('https');

var sendCodeFx = function(codeObj, verb, setAsActive, cb){

	var codeString = JSON.stringify(codeObj);

	var headers = {
		'content-type': 'application/json',
		'X-BB-SESSION': grunt.config.get(target).session
	};

	var pluginParam = (codeObj && verb !== "POST") ? '/'+codeObj.name : '';
	var activeParam = setAsActive ? '/active' : '';

	var options = {
		host: grunt.config.get(target).host,
		port: grunt.config.get(target).port,
		path: '/admin/plugin'+pluginParam+activeParam,
		method: verb,
		headers: headers
	};



	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		var str = ''
		res.on('data', function (chunk) {
			str += chunk;
		});
		res.on('end', function () {
			cb(str);
		});

	});

	req.write(codeString);
	req.on('error', function (err) {
		console.log('ERROR: ' + err.message);
	});
	req.end();
};


var doDeleteCodeFx = function(name, cb){

	var headers = {
		'content-type': 'application/x-www-form-urlencoded',
		'X-BB-SESSION': grunt.config.get(target).session
	};

	var pluginParam = '/'+name;

	var options = {
		host: grunt.config.get(target).host,
		port: grunt.config.get(target).port,
		path: '/admin/plugin'+pluginParam,
		method: 'DELETE',
		headers: headers
	};

	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		var str = ''
		res.on('data', function (chunk) {
			str += chunk;
		});
		res.on('end', function () {
			cb(str);
		});
	});

	req.on('error', function (err) {
		console.log('ERROR: ' + err.message);
	});
	req.end();
};


var getCodeFx = function(pluginName, cb){

	var headers = {
		'content-type': 'application/json',
		'X-BB-SESSION': grunt.config.get(target).session
	};

	var options = {
		host: grunt.config.get(target).host,
		port: grunt.config.get(target).port,
		path: '/admin/plugin'+pluginName,
		method: 'GET',
		headers: headers
	};

	var req = http.request(options, function(res) {
		console.log('RES: ' + res.statusCode);
		var str = ''
		res.on('data', function (chunk) {
			str += chunk;
		});

		res.on('end', function () {
			cb(JSON.parse(str));
		});

	});

	req.write("");
	req.on('error', function (err) {
		console.log('ERROR: ' + err.message);
	});
	req.end();
};

var getPluginCodeFx = function(pluginName, cb){
	getCodeFx(pluginName, cb);
};
var listPluginCodeFx = function(cb){
	getCodeFx('', cb);
};

var postNewCodeFx = function(name, code, setAsActive, cb){
	sendCodeFx({
		"lang": "javascript",
		"name": name,
		"code": code,
		"active": setAsActive
	}, 'POST', false, cb);
};

var updateCodeFx = function(name, code, setAsActive, cb){
	sendCodeFx({
		"name": name,
		"code": code
	}, 'PUT', false, cb);
};

var deleteCodeFx = function(name, cb){
	doDeleteCodeFx(name, cb);
};

var deleteListFx = function(libsToSend, cb){
	console.log("deleting: "+libsToSend.length);
	if(!libsToSend.length){cb();return;}
	//libsToSend = libsToSend.reverse();
	var processNext = function(nextStep){
		console.log("go to delete: "+libsToSend[nextStep]);
		deleteCodeFx(libsToSend[nextStep], function(res){
			nextStep++;
			if(libsToSend.length <= nextStep){
				cb();
				return;
			}else{
				processNext(nextStep);
			}
		});
	};
	processNext(0);
};

var createListFx = function(libsToSend, cb){
	console.log("creating: "+libsToSend.length);
	if(!libsToSend.length){cb();return;}
	//libsToSend = libsToSend.reverse();
	var processNext = function(nextStep){

		console.log("go to create: "+libsToSend[nextStep].nameNewOnBB);

		postNewCodeFx(libsToSend[nextStep].nameNewOnBB, libsToSend[nextStep].code, true, function(res){
			console.log(">msg: "+res);
			nextStep++;
			if(libsToSend.length <= nextStep){
				cb();
				return;
			}else{
				processNext(nextStep);
			}
		});
	};
	processNext(0);
};

var updateListFx = function(libsToSend, cb){
	console.log("updating: "+libsToSend.length);
	if(!libsToSend.length){cb();return;}
	//libsToSend = libsToSend.reverse();
	var processNext = function(nextStep){
		console.log("go to update: "+libsToSend[nextStep].nameNewOnBB);
		updateCodeFx(libsToSend[nextStep].nameNewOnBB, libsToSend[nextStep].code, true, function(res){
			nextStep++;
			if(libsToSend.length <= nextStep){
				cb();
				return;
			}else{
				processNext(nextStep);
			}
		});
	};
	processNext(0);
};

module.exports = {
	sendCode: sendCodeFx,
	getCode: getCodeFx,
	getPluginCode: getPluginCodeFx,
	listPluginCode: listPluginCodeFx,
	postNewCode: postNewCodeFx,
	updateCode: updateCodeFx,
	deleteCode: deleteCodeFx,
	createList: createListFx,
	updateList: updateListFx,
	deleteList: deleteListFx
};