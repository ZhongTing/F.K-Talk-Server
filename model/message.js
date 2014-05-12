var db = require('./db');
var user = require('./user');
var connection = db.connection;
var gcm = require("../model/gcmService");
var mqtt = require("./fkmqtt");

function sendMsg(response, postData)
{
    if(!postData.sp)
    {
        response.end();
        return;
    }
    response.end();
    connection.beginTransaction(function(error)
    {
    	if(error)return  mqtt.action(postData.sp,"error","sendMsg failed")
    	if(postData.message=="")return mqtt.action(postData.sp,"error", "message empty")
    	user.getUidAndNameByToken(postData.token,onGetUid);
        var selfName, selfUid;
    	function onGetUid(error, result)
    	{
    		if(error || result.length == 0)return mqtt.action(postData.sp,"error", "token error");
    		insertMsg(result[0].uid);
            selfUid = result[0].uid;
            selfName = result[0].name;
    	}
    	function insertMsg(selfUid)
    	{
    		var sql = "INSERT INTO message(senderUID, recieverUID, message) SELECT ? , uid, ? FROM user WHERE phone = ?";
    		var data = [selfUid, postData.message, postData.phone];
    		connection.query(sql, data, onInsertMsg);
    	}
    	function onInsertMsg(error, result, field, a)
    	{
    		if(error) return mqtt.action(postData.sp,"error", "sendMsg failed");
    		if(result&&result.affectedRows==0)
			{
				return mqtt.action(postData.sp,"error", "phone not found");
			}
            addUnreadCounter(selfUid, postData.phone);
			queryTimeStamp(result.insertId);
    	}
    	function queryTimeStamp(messageId)
    	{
    		var sql = "SELECT UNIX_TIMESTAMP(now()) as timestamp , message, mid as messageId from message where mid = " + messageId;
    		if(error)
    		{
    			connection.rollback(function(){
    				return mqtt.action(postData.sp,"error", "sendMsg failed");
    			})
    		}
    		connection.query(sql, function(error, result){
				if(!result || result.length==0)
				{
					return connection.rollback(function() {
						mqtt.action(postData.sp,"error", "sendMsg failed");
					});
				}
				connection.commit(function(err){
					if (err) 
					{ 
						connection.rollback(function() {
							throw err;
						});
					}
                    var a = result[0];
                    a.sender = postData.sp;
                    a.receiver = postData.phone;
                    var resultValue = {};
                    resultValue.phone = postData.sp;
                    resultValue.Msg = a;
                    mqtt.action(postData.phone,"addMsg",resultValue);
                    resultValue.phone = postData.phone;
                    mqtt.action(postData.sp,"addMsg",resultValue);
                    
                    var m = gcm.newMsg();
                    var message = selfName + ":" + postData.message;
                    var obj = message.match(/{&#&type&#&:(\d+),&#&data&#&:({.*}),&#&message&#&:&#&(.*)&#&}/);
                    if(obj && obj[1] == 1){
                        message = "傳送位置訊息";
                    }
+                   m.addData("message", message);
                    gcm.sendByPhone(postData.phone,m);
				});
    		})
    	}
        function addUnreadCounter(selfUid, phone)
        {
            var sql = "update friend inner join user on selfUid = uid set unreadCounter = unreadCounter +1 WHERE friendUid = ? and phone = ?";
            connection.query(sql, [selfUid, phone], function(error, result){
                if(!error&&result.affectedRows!=0)
                {
                    // mqtt.action(postData.phone,"error", "postData.sp");
                }
            })
        }
    })
}

function readMsg(response, postData)
{
    var selfName;
    if(!postData.sp)
    {
        response.end();
        return;
    }
    response.end();
    user.getUidByToken(postData.token,onGetUid);
    function onGetUid(error, result)
    {
        if(error || result.length == 0)return mqtt.action(postData.sp,"error", "token error");
        updateReadMsg(result[0].uid);
        resetUnreadCounter(result[0].uid,postData.phone);
    }
    function updateReadMsg(selfUid)
    {
        var sql = "UPDATE friend, ( SELECT uid FROM user WHERE phone = ? ) AS user SET hasReadMsgId = ? WHERE selfUid = ? AND friendUid = user.uid";
        var data = [postData.phone, postData.hasReadMsgId, selfUid];
        connection.query(sql, data, function(error, result){
            if(error)return mqtt.action(postData.sp,"error", error)
            if(!result&&result.changeRows==0)return mqtt.action(postData.sp,"error", "send read message failed");
            var a = {};
            a.phone = postData.sp;
            a.hasReadMsgId = postData.hasReadMsgId;
            mqtt.action(postData.phone,"hasRead",a);
        })
    }
    function resetUnreadCounter(selfUid, phone)
    {
        var sql = "update friend inner join user on friendUid = uid set unreadCounter = 0 WHERE selfUid = ? and phone = ?";
        connection.query(sql, [selfUid, phone], function(error, result) {
            //if(error||result.affectedRows==0)console.log(error)
        })
    }
}

//unuseless
function listMsg(response, postData)
{
    var sql = "SELECT user.phone AS receiver, temp.mid AS messageId, message, temp.timestamp, sender FROM user, ( SELECT mid, senderUID, recieverUID, message, TIMESTAMP, phone AS sender FROM  `message` AS m INNER JOIN user ON m.senderUID = user.uid WHERE ((recieverUID =? AND  `senderUID` =? ) OR ( senderUID =? AND recieverUID =? ) ) AND mid >? ORDER BY mid) AS temp WHERE temp.recieverUID = user.uid";    var friendUid;
    var selfUid;
    user.getUidByToken(postData.token,onGetUid);
    response.end();
    function onGetUid(error, result)
    {
        if(error || result.length == 0)return mqtt.action(postData.sp,"error", "token error");
        selfUid = result[0].uid;
        user.getUidByPhone(postData.phone, function(error, result){
            if(error || result.length == 0)return mqtt.action(postData.sp,"error", "token error");
            friendUid = result[0].uid
            queryMsgList();              
        })
    }
    function queryMsgList()
    {
        var mid = 0;
        if(postData.mid)mid = postData.mid;
        var data = [selfUid, friendUid, selfUid, friendUid, mid];
        connection.query(sql, data, function(error, result){
            if(error)return mqtt.action(postData.sp,"error", error);
            var resultValue = {};
            resultValue.phone = postData.phone;
            resultValue.Msgs = result;
            mqtt.action(postData.sp,"listMsg", resultValue);
        })
    }
}

function listCounter(response, postData)
{
    var sql = "SELECT phone, unreadCounter as counter FROM `friend` inner join user on friendUid = uid WHERE selfUid = ?";
    var selfUid;
    user.getUidByToken(postData.token,onGetUid);
    response.end();
    function onGetUid(error, result)
    {
        if(error || result.length == 0)return mqtt.action(postData.sp,"error", "token error");
        selfUid = result[0].uid;
        connection.query(sql,[selfUid],function(error, result){
            if(error)return mqtt.action(postData.sp, "error", "listCounter Failed");
            mqtt.action(postData.sp, "updateCounter", result);
        });
    }
}
exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;
exports.listCounter = listCounter;
