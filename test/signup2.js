var http = require("http");

var data = JSON.stringify({
    phone : '0987123456',
    password : 'b1234',
    name : '陳英一',
    mail : 'enee@gmail.com',
    gcmRegId : '1234560',
    photo : '1235345'
});

var options = {
    host: 'localhost',
    port: 8888,
    path: '/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }
};

var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log(chunk);
    });
});

req.write(data);
req.end();