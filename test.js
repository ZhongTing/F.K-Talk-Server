var https = require("https");
var querystring = require('querystring');
 
var data = querystring.stringify({
    access_token : 'ya29.HwBAXd9OnMViNysAAAC1aHh5KHnl--y29_svOH1WDJrvaeIkS5sgng1T3w0rNs6uorsn3uh1N5sxjnaFJUs'
});

var options = {
    host: 'www.googleapis.com',
    path: '/oauth2/v2/tokeninfo',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    },
    agent: false
};

var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log("body: " + chunk);
    });
});

req.write(data);
req.end();