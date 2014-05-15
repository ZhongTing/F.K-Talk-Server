var connection = require('./db').connection;
var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyBsf4l9d4mpSaT2QH9ybpRd6GccU-367RU');

function send(regId,msgObject,callback)
{
	var registrationIds = [];
	registrationIds.push(regId);
	sender.send(msgObject, registrationIds, 4, function (err, result) {
    	console.log(msgObject);
    	console.log(result);
	});
}
function sendByPhone(phone, msgObject, callback)
{
	var sql = "SELECT `gcmRegId` FROM gcm natural join user where phone = ?"
    connection.query(sql, [phone], function(error, result){
        if(error)return console.log("sendGCM failed");
        if(result.length == 0)return console.log("sendGCM phone not found");
        var id = result[0].gcmRegId;
        send(id, msgObject, callback);
    })
}
function getMessage()
{
	var m = new gcm.Message();
	m.delayWhileIdle = true;
	return m;
}

exports.send = send;
exports.sendByPhone = sendByPhone;
exports.newMsg = getMessage
