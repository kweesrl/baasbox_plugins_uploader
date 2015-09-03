// files to deploy
var libsArr = require("./Config.sources.libsToDeploy.js");
var endpointsArr = require("./Config.sources.endpointsToDeploy.js");
var ignoreArr = require("./Config.sources.toIgnore.js");
var grunt = require("grunt");

var filesToDeploy = {
	libs: libsArr,
	endpoints: endpointsArr,
	ignore: ignoreArr
};

// settigns
var build = grunt.option('build') ? grunt.option('build') : '';
var target = grunt.option('target') ? grunt.option('target').toUpperCase() : 'DEV';
var forceBuild = true;
var deleteUnusedFiles = false;
var libPrefix = 'kweeBE';
var endpointPrefix = 'kweeEP';
var deprecatedPrefix = 'kweeNS';
var pluginDir = '/Users/antoniodellava/Google\ Drive/KWEE/KweeApp/BB\ -\ End\ Points/workInProgress/';

// end settings begin config logic
module.exports = {
	pluginDir: pluginDir,
	buildPrefix: build,
	libPrefix: libPrefix,
	endpointPrefix: endpointPrefix,
	deprecatedPrefix: deprecatedPrefix,
	options: {
		forceBuild: forceBuild,
		deleteUnusedFiles: deleteUnusedFiles
	},
	filesToDeploy: {
		libs: function(){
			var arr = [];
			filesToDeploy.libs.arr.forEach(function(item){
				if(target == 'DEV' || build == ''){
					arr.push({
						name: item,
						nameLocal: [libPrefix, item].join('.'),
						nameOnBB: [libPrefix, item].join('.'),
						nameNewOnBB: [libPrefix, item].join('.'),
						file: [libPrefix, item, 'js'].join('.')
					});
				}else{
					arr.push({
						name: item,
						nameLocal: [libPrefix, item].join('.'),
						nameOnBB: ["build"+build, item].join('.'),
						nameNewOnBB: ["build"+build, libPrefix, item].join('.'),
						file: [libPrefix, item, 'js'].join('.')
					});
				}
				return item;
			});
			return arr;
		},
		endpoints: function(){
			var arr = [];
			filesToDeploy.endpoints.arr.forEach(function(item){
				if(target == 'DEV' || build == '') {
					arr.push({
						name: item,
						nameLocal: [endpointPrefix, item].join('.'),
						nameOnBB: [endpointPrefix, item].join('.'),
						nameNewOnBB: item,
						file: [endpointPrefix, item, 'js'].join('.')
					});
				}else{
					arr.push({
						name: item,
						nameLocal: [endpointPrefix, item].join('.'),
						nameOnBB: ["build"+build, endpointPrefix, item].join('.'),
						nameNewOnBB: ["build"+build, item].join('.'),
						file: [endpointPrefix, item, 'js'].join('.')
					});
				}
			});
			return arr;
		},
		toIgnore: function(){
			var arr = [];
			filesToDeploy.ignore.arr.forEach(function(item){
				var prefix = item.type == "lib" ? libPrefix : endpointPrefix;
				var str = prefix+"."+item.name;
				arr.push(str);
			});
			return arr;
		}
	}
};