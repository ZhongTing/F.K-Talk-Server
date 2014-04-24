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
    		var sql = "SELECT UNIX_TIMESTAMP(timestamp) as timestamp from message WHERE mid = " + messageId;
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
					gcmhere();
                    console.log(result);
					response.write(JSON.stringify(result[0]));
					response.end();
				});
    		})
    	}
    	function gcmhere()
    	{
            var sql = "SELECT `gcmRegId` FROM gcm natural join user where phone = ?"
            connection.query(sql, [postData.phone], function(error, result){
                if(error) return common.errorResponse(response, "sendGCM failed");
                if(result.length == 0) return common.errorResponse(response, "phone not found");
                var id = result[0].gcmRegId;
                var message = {
                    collapse_key: 'Collapse key', 
                    data : {message : postData.message}
                };
                gcm.send(id,message);
            })
        }
    })
}

function readMsg(response, postData)
{
    user.getUidByToken(postData.token,onGetUid);
    function onGetUid(error, result)
    {
        if(error || result.length == 0)return common.errorResponse(response, "token error");
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
            response.write(JSON.stringify({"timestamp":timestamp}));
            response.end();
        })
    }
}

function listMsg(response, postData)
{
    var sql = "SELECT name, phone, message, UNIX_TIMESTAMP(timestamp) as timestamp FROM `message` AS m INNER JOIN user ON m.senderUID = user.uid WHERE ((recieverUID = ? and `senderUID` = ?) or (senderUID = ? and recieverUID = ?)) and timestamp > FROM_UNIXTIME( ? )"
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

exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;