var connection = require('./db').connection
var FK = require('./FK');
var gcm = require("../model/gcmService");
var mqtt = require("./fkmqtt");

function listCounter(response, postData)
{
	var sql = "\
		SELECT phone, unreadCounter as counter  \
		FROM friend inner join user 			\
		on uid = friendUID 						\
		WHERE selfUID	 						\
		IN (									\
			SELECT uid AS selfUID				\
			FROM user							\
			WHERE token = ?						\
		)";
	connection.query(sql, [postData.token], function(error,result){
		if(error)return mqtt.action(postData.token, "error", "list counter error");
		mqtt.action(postData.token, "updateCounter", result);
		response.end();
	})
}

function sendMsg(response, postData)
{

}

function readMsg(response, postData)
{

}
 
function listMsg(response, postData)
{

}

exports.listCounter = listCounter;
exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;