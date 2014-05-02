var http = require("http");

var data = JSON.stringify({
    phone : '1',
    mail :　'gary',
    token : "7d4ac500-cc57-11e3-a",
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/setting',
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