var http = require("http");

var data = JSON.stringify({
    token : '554bd040-cada-11e3-a',
    phone : '0987103180',
    timestamp : 1298330388
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/listMsg',
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
        var a = JSON.parse(chunk);
        console.log(a);
    });
});

req.write(data);
req.end();