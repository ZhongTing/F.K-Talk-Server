var http = require("http");

var data = JSON.stringify({
    token : 'c295e0e0-ca9f-11e3-b',
    phone : '0961276368',
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/readMsg',
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