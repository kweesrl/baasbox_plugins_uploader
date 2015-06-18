var fs = require('fs');
var grunt = require('grunt');


var getFileFx = function(fileName, cb){
	fs.readFile(grunt.config.get('pluginDir')+fileName, 'utf8', function (err, data) {
		if (err) {
			grunt.log.writeln(err);
		}
		cb(data);
	});
};

var getFilesFx = function(arr, cb){
	var resArr = [];
	var getNext = function(next){
		getFileFx(arr[next].file, function(code){
			arr[next].code = code;
			resArr.push(arr[next]);
			next++;
			if(arr.length === next){
				cb(resArr);
			}else{
				getNext(next);
			}
		});
	};
	getNext(0);
};

module.exports = {
	getFile: getFileFx,
	getFiles: getFilesFx
};