var http = require("http");

var data = JSON.stringify({
    token : '2f468a60-cc57-11e3-a',
    phone : '0987103180',
    sp : '0961276368',
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/listCounter',
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