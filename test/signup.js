var querystring = require('querystring');
var http = require("http");

var data = querystring.stringify({
      phone : '0987103180',
      password : 'a1234',
      name : '謝宗廷',
      mail : 'gary62107@gmail.com',
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