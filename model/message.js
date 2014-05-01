// var gcm = require('node-gcm');
var db = require('./db');
var common =require('./common');
var user = require('./user');
var connection = db.connection;
var gcm = require("../model/gcmService");

function sendMsg(response, postData)
{
    connection.beginTransaction(function(error)
    {
    	if(error)return common.errorResponse(response, "sendMsg failed")
    	if(postData.message=="")return common.errorResponse(response, "message empty")
    	user.getUidByToken(postData.token,onGetUid);

    	function onGetUid(error, result)
    	{
    		if(error || result.length == 0)return common.errorResponse(response, "token error");
    		insertMsg(result[0].uid);
    	}
    	function insertMsg(selfUid)
    	{
    		var sql = "INSERT INTO message(senderUID, recieverUID, message) SELECT ? , uid, ? FROM user WHERE phone = ?";
    		var data = [selfUid, postData.message, postData.phone];
    		connection.query(sql, data, onInsertMsg);
    	}
    	function onInsertMsg(error, result, field, a)
    	{
    		if(error) return common.errorResponse(response, "sendMsg failed");
    		if(result&&result.affectedRows==0)
			{
				return common.errorResponse(response, "phone not found");
			}
			queryTimeStamp(result.insertId);
    	}
    	function queryTimeStamp(messageId)
    	{
    		var sql = "SELECT UNIX_TIMESTAMP(timestamp) as timestamp , name, phone from message,user WHERE message.senderUID = user.uid and  mid = " + messageId;
    		if(error)
    		{
    			connection.rollback(function(){
    				return common.errorResponse(response, "sendMsg failed");
    			})
    		}
    		connection.query(sql, function(error, result){
				if(!result || result.length==0)
				{
					return connection.rollback(function() {
						common.errorResponse(response, "sendMsg failed");
					});
				}
				connection.commit(function(err){
					if (err) 
					{ 
						connection.rollback(function() {
							throw err;
						});
					}
                    var m = gcm.newMsg();
                    var message = result[0].name + ":" + postData.message;
                    var newMessageMsg = {};
                    newMessageMsg[result[0].phone] = postData.message;
                    m.addData("newmessage", JSON.stringify(newMessageMsg));
                    m.addData("message",message);
                    gcm.sendByPhone(postData.phone,m);
                    mqtt.publish(result[0].phone,JSON.stringify(m.data));
                    result[0].mid = messageId;
                    console.log(result);
					response.write(JSON.stringify(result[0]));
					response.end();
				});
    		})
    	}
    })
}

function readMsg(response, postData)
{
    var selfName;
    user.getUidAndNameByToken(postData.token,onGetUid);
    function onGetUid(error, result)
    {
        if(error || result.length == 0)return common.errorResponse(response, "token error");
        selfName = result[0].name;
        updateReadMsg(result[0].uid);
    }
    function updateReadMsg(selfUid)
    {
        var sql = "UPDATE friend, ( SELECT uid FROM user WHERE phone = ? ) AS user SET readTime = FROM_UNIXTIME(?) WHERE selfUid = ? AND friendUid = user.uid";
        var timestamp = Math.round(Date.now()/1000);
        var data = [postData.phone, timestamp, selfUid];
        connection.query(sql, data, function(error, result){
            if(error)return common.errorResponse(response, error)
            if(!result&&result.changeRows==0)return common.errorResponse(response, "send read message failed");
            var m = gcm.newMsg();
            var message = selfName + "已讀你的訊息";
            var readTimeMsg = {};
            readTimeMsg[selfName] = timestamp;
            m.addData("readtime", JSON.stringify(readTimeMsg));
            m.addData("message", message);
            gcm.sendByPhone(postData.phone,m);
            mqtt.publish(postData.phone, JSON.stringify(m.data));
            response.write(JSON.stringify({"timestamp":timestamp}));
            response.end();
        })
    }
}

function listMsg(response, postData)
{
    var sql = "SELECT mid, name, phone, message, UNIX_TIMESTAMP(timestamp) as timestamp FROM `message` AS m INNER JOIN user ON m.senderUID = user.uid WHERE ((recieverUID = ? and `senderUID` = ?) or (senderUID = ? and recieverUID = ?)) and timestamp > FROM_UNIXTIME( ? )"
    var friendUid;
    var selfUid;
    user.getUidByToken(postData.token,onGetUid);
    function onGetUid(error, result)
    {
        if(error || result.length == 0)return common.errorResponse(response, "token error");
        selfUid = result[0].uid;
        user.getUidByPhone(postData.phone, function(error, result){
            if(error || result.length == 0)return common.errorResponse(response, "token error");
            friendUid = result[0].uid
            queryMsgList();              
        })
    }
    function queryMsgList()
    {
        var data = [selfUid, friendUid, selfUid, friendUid, postData.timestamp];
        console.log(data);
        connection.query(sql, data, function(error, result){
            if(error)return common.errorResponse(response, error);
            // if(error)throw error
            response.write(JSON.stringify(result));
            response.end();
        })
    }
}

function getFriendRead(response, postData)
{
    var sql = "SELECT UNIX_TIMESTAMP(readTime) as readTime FROM friend WHERE friendUid IN ( SELECT uid FROM user WHERE token = ? ) AND selfUId IN ( SELECT uid FROM user WHERE phone =?)";
    var data = [postData.token,postData.phone];
    connection.query(sql, data, function(error,result){
        // if(error) return common.errorResponse(response, JSON.stringify(error));
        if(error) throw error;
        if(result.length==0) return common.errorResponse(response, "get friend read failed");
        response.write(JSON.stringify(result[0]));
        response.end();
    })

}

exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;
exports.getFriendRead = getFriendRead;