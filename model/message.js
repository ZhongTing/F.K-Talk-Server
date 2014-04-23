// var gcm = require('node-gcm');
var db = require('./db');
var common =require('./common');
var user = require('./user');
var connection = db.connection;

function sendMsg(response, postData)
{
    connection.beginTransaction(function(error)
    {
    	if(error)return common.errorResponse(response, "sendMsg failed")
    	if(postData.message=="")return common.errorResponse(response, "message empty")
    	user.getUid(postData.token,onGetUid);

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
    		var sql = "SELECT timestamp from message WHERE mid = " + messageId;
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
					response.write(JSON.stringify(result[0]));
					response.end();
				});

    		})
    	}
    	function gcmhere()
    	{

    	}
    })
}

function readMsg(response, postData)
{

}

function listMsg(response, postData)
{

}

exports.sendMsg = sendMsg;
exports.readMsg = readMsg;
exports.listMsg = listMsg;