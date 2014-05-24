var http = require("http");

var data = JSON.stringify({
    token : '15d28300-dea3-11e3-b',
    type : 2,
    args : ['100000255741179']
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
