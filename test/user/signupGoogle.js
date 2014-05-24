var http = require("http");

var data = JSON.stringify({
    name : '謝宗廷',
    mail : 'gary621072@gmail.com',
    gcmRegId : '1234560',
    photo : '1235345',
    type : 2,
    phone:"0987103182",
    arg : '100000255741179'
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