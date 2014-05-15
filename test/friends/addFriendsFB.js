var http = require("http");

var data = JSON.stringify({
    token : 'acd04450-dc63-11e3-a',
    type : 1,
    args : ['123','12']
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/addFriends',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }
};

var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log("body: " + chunk);
    });
});

req.write(data);
req.end();