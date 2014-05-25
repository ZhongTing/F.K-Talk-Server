var http = require("http");

var data = JSON.stringify({
    type: 2,
    arg : 'ya29.IQCdo1JRlBAWHiUAAACkfkikWTzQXOOjn2Zswb9zxt0O1K9BV6DsE3djdZwDZm1pxGRDaKXLCaGnTYpdVAw',
    gcmRegId : '12345630'
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/login',
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