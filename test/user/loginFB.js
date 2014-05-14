var http = require("http");

var data = JSON.stringify({
    type: 1,
    arg : 'CAACEdEose0cBAFRqAvk4EdCfpgRhZAunW4ptU3k3ZC7hWW27tnZAPZA1UJirvqScOPwZAzsZAalYYKI1tSBbRcmJPMePKvddGSWhLwV3f7hq99V8qU75PF7JRJswzc1T98Onqmn1fLkAeOKvAmJX1UeuPmZBvXmMoAmiInZB9ZAqR9Nr4YrvtbcrCwTfgTZAu9UEE2oBoHiduR6QZDZD',
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