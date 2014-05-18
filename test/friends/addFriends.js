var http = require("http");

var data = JSON.stringify({
    token : 'acd04450-dc63-11e3-a',
    type : 0,
    args : ['0987103181','123','0987103180','0961276368']
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