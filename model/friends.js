var db = require("./db");
var connection = db.connection;
var user = require("./user");
var common = require("./common");
var mqtt = require("./fkmqtt");

function addFriend(response, postData)
{
	if(!postData.sp)
	{
		response.end();
		return;
	}
	user.getUidByToken(postData.token,onGetUid);
	function onGetUid(error,result)
	{
		var sql = "INSERT INTO friend (selfUid,friendUid) SELECT ?, uid FROM user WHERE phone = ?;";
		var sql2 = "INSERT INTO friend (selfUid,friendUid) SELECT uid, ? FROM user WHERE phone = ?;";
		var sql3 = "SELECT"
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();
		if(error || result.length == 0)return mqtt.action(postData.sp,"error", "token error");
		connection.beginTransaction(function(error){
			if(error)return mqtt.action(postData.sp,"error", "add freind failed");
			insert(sql, [result[0].uid,postData.phone], function(){
				insert(sql2, [result[0].uid,postData.phone], function(){
					connection.commit(function(err) {
						if (err) { 
							connection.rollback(function() {
								throw err;
							});
						}
						queryInfo("where uid = " + result[0].uid,function(error, result){
							if(error)mqtt.action(postData.phone,"error", "get FriendInfo error");
							mqtt.action(postData.phone,"updateFriend", result[0]);
						})
						queryInfo("where phone = "+postData.phone,function(error, result){
							if(error)mqtt.action(postData.sp,"error", "get FriendInfo error");
							mqtt.action(postData.sp,"updateFriend", result[0]);
						})
					});
				})
			});	
		});
		function queryInfo(whereSQL,callback)
		{
			var sql = "SELECT phone,photo,mail,unix_timestamp(now()) as timestamp, -1 as hasReadMsgId FROM `user`" + whereSQL;
			connection.query(sql, callback);
		}
		function insert(sql, insertData, callback)
		{
			var errorMsg = "";
			connection.query(sql, insertData, function(error, result)
			{
				if(error)
				{
					if(error.toString().match("ER_DUP_ENTRY: Duplicate entry .*? for key 'PRIMARY")!=null)
					{
						errorMsg = "already be friends";
					}
					else errorMsg = "add friend failed";
				}
				if(result&&result.affectedRows==0)
				{
					errorMsg = "phone not found";
				}
				if(errorMsg)
				{
					return connection.rollback(function() {
						mqtt.action(postData.sp,"error", errorMsg);
					});
				}
				callback();
			})
		}
	}
}

function listFriend(response, postData)
{
	if(!postData.sp)
	{
		response.end();
		return;
	}
	user.getUidByToken(postData.token,onGetUid);
	function onGetUid(error,result)
	{
		var sql = "SELECT name, phone, photo, mail, UNIX_TIMESTAMP(now()), hasReadMsgId as timestamp from (SELECT uid, name,phone,photo,mail FROM ( SELECT friendUid AS uid FROM  `friend`  NATURAL JOIN ( SELECT uid AS selfUid FROM user WHERE token = ? ) AS b ) AS c NATURAL JOIN user) as leftpart left JOIN friend on leftpart.uid = friend.selfUid and friend.friendUid = ?";
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();
		if(error || result.length == 0)return mqtt.action(postData.sp, "error", "token error");
		connection.query(sql,[postData.token,result[0].uid],function(error,results){
			if (error)
				return mqtt.action(postData.sp, "error", "listFriend failed");
			mqtt.action(postData.sp, "listFriend", results);
		})
	}
}
function deleteFriend(response, postData)
{
	if(!postData.sp)
	{
		response.end();
		return;
	}
	user.getUidByToken(postData.token,onGetUid);
	function onGetUid(error, result)
	{
		response.writeHead(200, {"Content-Type": "text/plain"});
		if(error || result.length == 0)return mqtt.action(postData.sp, "error", "token error");
		var selfUid = result[0].uid;
		user.getUidByPhone(postData.phone,function(error, result){
			var sql = "DELETE FROM `friend` WHERE `friend`.`selfUid` = ? AND `friend`.`friendUid` = ? LIMIT 1;";
			if(error || result.length == 0)return mqtt.action(postData.sp, "error", "phone error");
			var friendUid = result[0].uid;
			connection.beginTransaction(function(error){
				if(error)return mqtt.action(postData.sp,"error", "deleteFriend failed");
					connection.query(sql,[selfUid, friendUid],function(error,result){
						if(error || result.affectedRows==0)
						{
							response.end();
							return mqtt.action(postData.sp, "error", "deleteFriend failed");
						}
						connection.query(sql,[friendUid, selfUid],function(error,result){
							if(error || result.affectedRows==0)
							{
								connection.rollback();
								response.end();
								return mqtt.action(postData.sp, "error", "deleteFriend failed");
							}
							connection.commit(function(err) {
								if (err) { 
									connection.rollback(function() {
									throw err;
								});
								return mqtt.action(postData.sp, "error", "deleteFriend failed");
							}
							response.end();
							mqtt.action(postData.sp, "deleteFriend", {phone:postData.phone});
							mqtt.action(postData.phone, "deleteFriend", {photo:postData.sp});
						})
					})
				});	
			});
		});
	}
}
exports.addFriend = addFriend;
exports.listFriend = listFriend;
exports.deleteFriend = deleteFriend;