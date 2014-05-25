var https = require("https");
var querystring = require('querystring');
var type = {"FKTalk" : 0, "FB" : 1, "Google" :2};

function errorResponse(response, errorMsg)
{
    var responseData = {};
    responseData.error = errorMsg;
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(JSON.stringify(responseData));
    response.end();
}

function getGoogleId(token, callback)
{
    var data = querystring.stringify({
        access_token : token,
        fields:'user_id'
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
            var a = chunk.match(/"user_id":.*?"(.*?)"/);
            if(a)
                callback(a[1]);
            else
                callback(null);
        });
    });
    req.write(data);
    req.end();
}

exports.type = type;
exports.errorResponse = errorResponse;
exports.getGoogleId = getGoogleId