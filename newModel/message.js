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
	response.end();
	connection.query(sql, [postData.token], function(error,result){
		if(error)return mqtt.action(postData.token, "error", "list counter error");
		mqtt.action(postData.token, "updateCounter", result);
	});
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
	response.end();
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
	response.end();
	updateHasReadMsgId();
	resetUnReadCounter();

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

	var sql = "select t.mid as messageId, phone as sender, t.reciever, t.message, UNIX_TIMESTAMP(t.timestamp) as timestamp \
		from user,																						\
		(select distinct message.*,phone as reciever 													\
			from message inner join user on recieverUID = user.uid,										\
			(select uid from user where phone = ?) as friend,											\
			(select uid from user where token = ?) as self 												\
			where (self.uid = message.senderUID and friend.uid = message.recieverUID)					\
			or (self.uid = message.recieverUID and friend.uid = message.senderUID)) as t 				\
		where t.senderUID = user.uid order by mid";
	response.end();
	connection.query(sql, [postData.phone, postData.token], function(error, results){
		if(error)return mqtt.action(postData.phone, "error", "listMsg error");
		var data = {};
		data.phone = postData.phone;
		data.Msgs = results;
		mqtt.action(postData.token, "listMsg", data);
	});
}

exports.listCounter = listCounter;
exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;