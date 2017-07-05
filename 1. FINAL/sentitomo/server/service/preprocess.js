var R = require("r-script");
var PythonShell = require('python-shell');
var franc = require('franc-min');

module.exports = {
    preprocessTweetMessage: function (tweetMessage) {
        var out = R("./server/ML/R/preprocess.R")
            .data({ message: tweetMessage })
            .callSync();
        return out;
    },
    detectLanguage: function (message) {
        return franc(message);
    }
};




/*
PythonShell.run('./server/ML/Python/myscript.py', {
    args: ['hello', 'world']
}, function (err, results) {
    if (err) console.log(err);
    console.log('results: %j', results);
    console.log("finish")
});


var pyshell = new PythonShell('./server/ML/Python/myscript.py');

// sends a message to the Python script via stdin
pyshell.send('hello');

pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    if (err) throw err;
    console.log('finished');
});*/