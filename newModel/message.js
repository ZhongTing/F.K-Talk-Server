var connection = require('./db').connection
var FK = require('./FK');
var gcm = require("./gcmService");
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
	var sql = "\
		INSERT INTO message( senderUID, recieverUID, message )	\
		SELECT * ,  ? AS message								\
		FROM (													\
			SELECT uid AS senderUID								\
			FROM user											\
			WHERE token = ?										\
		) AS a, (												\
			SELECT uid AS recieverUID							\
			FROM user											\
			WHERE phone = ?										\
		) AS c";
	var sqlData = [postData.message, postData.token, postData.phone];
	connection.query(sql, sqlData, function(error, results){
		if(error || results.affectedRows == 0)
			return mqtt.action(postData.token, "error", "sendMsg error");
		var sql = "\
			SELECT f. * , user.phone AS sender, user.name		\
			FROM (												\
				SELECT mid AS messageId, senderUID, phone AS receiver, token, message, UNIX_TIMESTAMP( TIMESTAMP ) AS timestamp\
				FROM message									\
				INNER JOIN user ON recieverUID = uid 			\
				WHERE mid = ? 									\
			) AS f, user										\
			WHERE user.uid = f.senderUID";
		connection.query(sql, [results.insertId], function(error, results){
			if(error || results.length == 0)
				return mqtt.action(postData.token, "error", "sendMsg error");
			var recieverToken = results[0].token;
			var selfName = results[0].name;
			var selfUID = results[0].senderUID;
			delete results[0].name;
			delete results[0].senderUID;
			delete results[0].token;
			var data = {};
			data.Msg = results[0];
			data.phone = results[0].receiver;
			mqtt.action(postData.token, "addMsg", data);
			data.phone = results[0].sender;
			mqtt.action(recieverToken, "addMsg", data);

			sendGCM(selfName, postData.message, postData.phone);
			addUnreadCounter(selfUID, postData.phone);
			response.end();
		});
	})
	function sendGCM(selfName, message, phone)
	{
		var m = gcm.newMsg();
		var message = selfName + ":" + message;
		var obj = message.match(/{&#&type&#&:(\d+),&#&data&#&:({.*}),&#&message&#&:&#&(.*)&#&}/);
		if(obj && obj[1] == 1)
		{
			message = selfName + ":傳送位置訊息";
		}
		m.addData("message", message);
		gcm.sendByPhone(phone,m);
	}
	function addUnreadCounter(selfUID, phone)
    {
        var sql = "update friend inner join user on selfUid = uid 	\
        	set unreadCounter = unreadCounter +1 					\
        	WHERE phone = ? and friendUID = ?";
        connection.query(sql, [phone, selfUID], function(error, result){
            if(error)console.log(error);
            console.log(result);
        })
    }
}

function readMsg(response, postData)
{
	updateHasReadMsgId();
	resetUnReadCounter();
	response.end();

	function updateHasReadMsgId()
	{
		var sql = "UPDATE friend,							\
			(SELECT uid FROM user WHERE phone = ?) AS user,	\
			(SELECT uid FROM user WHERE token = ?) AS self	\
			SET hasReadMsgId = ? 							\
			WHERE selfUid = self.uid AND friendUid = user.uid";
		var sqlData = [postData.phone, postData.token, postData.hasReadMsgId];
		connection.query(sql, sqlData, function(error, results){
			if(error || results.changedRows==0)
			{
				console.log(error);
				return mqtt.action(postData.token, "error", "update hasReadMsgId failed");
			}
			return mqtt.action(postData.token, "hasRead", {"phone":postData.phone, "hasReadMsgId":postData.hasReadMsgId});
		});
	}
	function resetUnReadCounter()
	{
		var sql = "UPDATE friend INNER JOIN user ON friendUid = uid,	\
			(SELECT uid FROM user WHERE token = ?) AS self 				\
			SET unreadCounter = 0 										\
			WHERE selfUid = self.uid AND phone = ?";
        connection.query(sql, [postData.token, postData.phone], function(error, result) {
            if(error || result.affectedRows == 0)
            {
            	return mqtt.action(postData.token, "error", "resetUnReadCounter failed");
            }
        })
	}
}
 
function listMsg(response, postData)
{

}

exports.listCounter = listCounter;
exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;