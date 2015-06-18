module.exports = function(grunt) {
	grunt.log.ok("LET'S START...");

	var _  = require("lodash");

	// load npm tasks
	grunt.loadNpmTasks('grunt-folder-list');

	// set config
	var config = {pkg: grunt.file.readJSON('package.json')};
	config = _.merge(config, require("./Config.rest.js"));
	config = _.merge(config, require("./Config.sources.js"));
	grunt.initConfig(config);

	// Options
	grunt.option("projectName", config.pkg.name);


	// Default task(s).
	grunt.registerTask('default', []);
	grunt.registerTask('deploy', 'Running "deploy" task', function() {

		var done = this.async();
		var libsDone = false;
		var epDone = false;
		var bbRest = require("./BB.rest.js");
		var bbSrc = require("./BB.sources.js");
		var optCodebase = grunt.option('codebase') ? grunt.option('codebase').toUpperCase() : 'ALL'; // ALL, ENDPOINTS, LIBS
		var removeDeleted = grunt.option('rmdl') ? Boolean( grunt.option('rmdl') ) : false;
		var build = grunt.option('build') ? grunt.option('build') : '';
		var target = grunt.option('target') ? grunt.option('target').toUpperCase() : 'DEV';
		console.log("let's start, removeDeleted="+removeDeleted);

		// 1 ottengo la lista dei file attualmente esistenti
		bbRest.listPluginCode(function(res){

			var currentFiles = res.data;
			// 2 prendo la lista dei file da deployare
			var libsToUpload = grunt.config.get('filesToDeploy').libs();
			var fileToIgnore= grunt.config.get('filesToDeploy').toIgnore();
			var endpointsToUpload = grunt.config.get('filesToDeploy').endpoints();

			var endFx = function(){
				libsDone = true;
				if( optCodebase == 'LIBS'){
					done(true);
				}else{
					if( optCodebase == 'ALL' || optCodebase == 'ENDPOINTS' ){
						console.log("go to deploy endpoints..");
						bbSrc.getFiles(endpointsToUpload, function(res){

							var epToUploadWithCode = res;

							epToUploadWithCode.forEach(function(itemToUpload, indexToUpload, arrToUpload){

								if(target !== 'DEV' && build !== '') {
									itemToUpload.code = itemToUpload.code.replace(/var BUILD_REFERENCE = '';/g, "var BUILD_REFERENCE = 'build"+build+".';");
								}

								return itemToUpload;
							});

							var epToSend = {
								deleted: [],
								updated: [],
								new: []
							};
							var idsToSend = {
								deleted: [],
								updated: [],
								new: []
							};
							currentFiles.forEach(function(itemDeployed, index, arr){
								if((itemDeployed.name.split('.')[0] == grunt.config.get('endpointPrefix') || itemDeployed.name.split('.')[1] == grunt.config.get('endpointPrefix')) && fileToIgnore.indexOf(itemDeployed.name) == -1){
									// se è presente tra le lib attuali è da aggiornare
									// --> aggiungo all'arr updated e elimino da libsToUpload
									var itemDeployedFound = false;
									var itemToUlploadIndex = -1;
									epToUploadWithCode.forEach(function(itemToUpload, indexToUpload, arrToUpload){

										grunt.log.debug(itemToUpload.nameNewOnBB);
										grunt.log.debug(itemDeployed.name);

										if(itemToUpload.nameNewOnBB == itemDeployed.name){
											idsToSend.updated.push(itemToUpload.nameNewOnBB);
											epToSend.updated.push(itemToUpload);
											itemToUlploadIndex = indexToUpload;
											itemDeployedFound = true;
										}
										return itemToUpload;
									});
									if(itemToUlploadIndex >= 0){epToUploadWithCode.splice(itemToUlploadIndex, 1);};

									// se NON è presente tra le lib attuali è da eliminare
									// --> aggiungo all'arr deleted e elimino da libsToUpload
									if(!itemDeployedFound){epToSend.deleted.push(itemDeployed); idsToSend.deleted.push(itemDeployed.name)};
								};
							});
							// tutto quello che è rimasto in libsToUpload è nuovo
							// --> new = al rimanente di libsToUpload
							epToSend.new = epToUploadWithCode;
							epToUploadWithCode.forEach(function(itm){
								idsToSend.new.push(itm.nameOnBB);
							});

							var endFx = function(){
								libsDone = true;
								if( optCodebase == 'ENDPOINTS' || libsDone){
									done(true);
								}
							};

							// 4A creo i nuovi endpoit
							bbRest.createList(epToSend.new, function(){
								// 4B aggiorno gli endpoint esistenti
								bbRest.updateList(epToSend.updated, function(){
									// 4C elimino gli endpoint non più presenti se rmdl
									if(!removeDeleted){
										endFx();
									}else{
										bbRest.deleteList(epToSend.deleted, function(){
											endFx();
										});
									}
								});
							});
						});
					}
				}
			};

			if( optCodebase == 'ALL' || optCodebase == 'LIBS' ){
				console.log("go to deploy libs..");
				bbSrc.getFiles(libsToUpload, function(res){
					// 3  divido la lista dei file in n.3 array: da eliminare, da aggiornare, da creare

					var libsToUploadWithCode = res;

					libsToUploadWithCode.forEach(function(itemToUpload, indexToUpload, arrToUpload){

						if(target !== 'DEV' && build !== '') {
							itemToUpload.code = itemToUpload.code.replace(/var BUILD_REFERENCE = '';/g, "var BUILD_REFERENCE = 'build"+build+".';");
						}

						return itemToUpload;
					});

					var libsToSend = {
						deleted: [],
						updated: [],
						new: []
					};
					var idsToSend = {
						deleted: [],
						updated: [],
						new: []
					};
					currentFiles.forEach(function(itemDeployed, index, arr){
						if((itemDeployed.name.split('.')[1] == grunt.config.get('libPrefix') || itemDeployed.name.split('.')[0] == grunt.config.get('libPrefix')) && fileToIgnore.indexOf(itemDeployed.name) == -1){
							// se è presente tra le lib attuali è da aggiornare
							// --> aggiungo all'arr updated e elimino da libsToUpload
							var itemDeployedFound = false;
							var itemToUlploadIndex = -1;
							libsToUploadWithCode.forEach(function(itemToUpload, indexToUpload, arrToUpload){



								if(itemToUpload.nameNewOnBB == itemDeployed.name){
									idsToSend.updated.push(itemToUpload.nameNewOnBB);
									libsToSend.updated.push(itemToUpload);
									itemToUlploadIndex = indexToUpload;
									itemDeployedFound = true;
								}
								return itemToUpload;
							});
							if(itemToUlploadIndex >= 0){libsToUploadWithCode.splice(itemToUlploadIndex, 1);};

							// se NON è presente tra le lib attuali è da eliminare
							// --> aggiungo all'arr deleted e elimino da libsToUpload
							if(!itemDeployedFound){libsToSend.deleted.push(itemDeployed); idsToSend.deleted.push(itemDeployed.name)};
						};
					});
					// tutto quello che è rimasto in libsToUpload è nuovo
					// --> new = al rimanente di libsToUpload
					libsToSend.new = libsToUploadWithCode;
					libsToUploadWithCode.forEach(function(itm){
						idsToSend.new.push(itm.nameOnBB);
					});

					// 4A creo i nuovi endpoit
					bbRest.createList(libsToSend.new, function(){
						// 4B aggiorno gli endpoint esistenti
						bbRest.updateList(libsToSend.updated, function(){
							// 4C elimino gli endpoint non più presenti se rmdl
							if(!removeDeleted){
								endFx();
							}else{
								bbRest.deleteList(libsToSend.deleted, function(){
									endFx();
								});
							}
						});
					});
				});
			}else{
				endFx();
			}
		});

	});


	grunt.registerTask('list', 'Running "list" task', function() {
		var done = this.async();
		var fs = require('fs');
		var res = [];
		fs.readdir(grunt.config.get('pluginDir'), function(err, files) {
			if (err) return;
			var untill = files.length-1;
			files.forEach(function(f,index) {
				var fArr = f.split('.');
				if('js' == fArr[fArr.length-1]){
					if(fArr[0] == grunt.config.get('endpointPrefix')){
						var tArr = fArr;
						tArr.splice(fArr.length-1, 1);
						tArr.splice(0, 1);
						var name = tArr.join('.');
						res.push(name);
					}
					if(untill === index){
						fs.writeFile("Config.sources.endpointsToDeploy.js", 'module.exports = {arr:'+JSON.stringify(res, null, 4)+'};', function(err) {
							if(err) {
								return console.log(err);
							}
							console.log("The endpoints index proposal was saved in 'Config.sources.endpointsToDeploy.js'!");
						});
					}
				}
			});
		});
	});

	grunt.registerTask('delete', 'Running "delete" task', function() {
		var done = this.async();
		// TODO
	});

};
