var https = require("https");
var querystring = require('querystring');

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

getGoogleId("ya29.IQCdo1JRlBAWHiUAAACkfkikWTzQXOOjn2Zswb9zxt0O1K9BV6DsE3djdZwDZm1pxGRDaKXLCaGnTYpdVAw",function(id){
    console.log(id);
})
exports.getGoogleId = getGoogleId