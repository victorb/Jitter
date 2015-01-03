var sparkly = require('sparkly');

console.log('Lets figure out the jitter of this network connection');

var interval = 0.05;
if(process.argv[2] !== undefined) {
  interval = process.argv[2];
}
var site = "https://www.google.com";
if(process.argv[3] !== undefined) {
	site = process.argv[3];
}

var spawn = require('child_process').spawn;
var cmd  = spawn('ping', ['-i ' + interval,'www.google.com']);
var counter = 0;

var prevMessage = new Date();
var thisMessage = new Date();

function timeSinceLast() {
	var newValue = thisMessage.getTime() - prevMessage.getTime();
	prevMessage = thisMessage;
	thisMessage = new Date();
	return newValue;
}

function execSpark() {
	var jitterGraph = null;
	var pingGraph = null;
	function done(_jitterGraph, _pingGraph) {
		if(_jitterGraph !== null) {
			jitterGraph = _jitterGraph;
		}
		if(_pingGraph !== null) {
			pingGraph = _pingGraph;
		}
		if(jitterGraph !== null && pingGraph !== null) {
			averageJitter = countAverage(jitterValues);
			currentJitter = jitterValues[jitterValues.length - 1];
			averagePing = countAverage(pingValues);
			currentPing = pingValues[pingValues.length - 1];

			console.log('\u001B[2J\u001B[0;0f');
			console.log("    This is the performance of your network");
			console.log();
			console.log("\033[34m");
			console.log("Jitter:\t(Current: "+currentJitter+"ms)  \t(Average: "+averageJitter+"ms)");
			console.log("\033[32m");
			console.log(jitterGraph);
			console.log("\033[34m");
			console.log("Ping:\t(Current: "+currentPing+"ms )\t(Average: "+averagePing+"ms)");
			console.log("\033[32m");
			console.log(pingGraph);
			console.log("\033[33m");
			console.log("With a good connection, these values should be as low as possible and the graph should move as smoothly as possible while it should also look as straight as possible.");
			console.log("\033[0m");
			console.log("Created by Victor Bjelkholm under MIT license 2014");
			console.log("https://www.twitter.com/VictorBjelkholm");
			console.log("");
			console.log("Source: https://www.github.com/VictorBjelkholm/Jitter");
		}
	}
	done(sparkly(jitterValues), null);
	done(null, sparkly(pingValues));
}

function countAverage(values) {
	var sum = 0;
	for( var i = 0; i < values.length; i++ ){
	  sum += parseInt( values[i], 10 ); //don't forget to add the base
	}
	var avg = sum/values.length;
	return Math.round(avg);
}

var jitterValues = [];
var pingValues = [];

var terminalLength = process.stdout.columns - 1;

function addToJitterValues(value) {
	if(jitterValues.length > terminalLength) {
		jitterValues.shift();
	}
	if(value !== null && value !== undefined) {
		jitterValues.push(value);
	}
}

function addToPingValues(value) {
	if(pingValues.length > terminalLength) {
		pingValues.shift();
	}
	if(value !== null && value !== undefined) {
		pingValues.push(parseInt(value));
	}
}

cmd.stdout.on('data', function(data) {
  var delay = data.toString().split(' ')[6].split('=')[1];
  var difference = timeSinceLast();
  addToJitterValues(difference);
  addToPingValues(delay);
  execSpark();
});

cmd.stderr.on('data', function(data) {
  console.log('stderr: ' + data);
});

cmd.on('exit', function(code) {
  console.log('exit code: ' + code);
  console.log(counter);
});
