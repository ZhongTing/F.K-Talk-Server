var db = require("./db");
var connection = db.connection;
var user = require("./user");
var common = require("./common");

function addFriend(response, postData)
{
	user.getUid(postData.token,onGetUid);
	function onGetUid(error,result)
	{
		var sql = "INSERT INTO friend (selfUid,friendUid) SELECT ?, uid FROM user WHERE phone = ?;";
		var sql2 = "INSERT INTO friend (selfUid,friendUid) SELECT uid, ? FROM user WHERE phone = ?;";
		response.writeHead(200, {"Content-Type": "text/plain"});
		if(error || result.length == 0)return common.errorResponse(response, "token error");
		insert(sql, [result[0].uid,postData.phone], function(){
			insert(sql2, [result[0].uid,postData.phone], function(){
				response.write("{}");
				response.end();
			})
		});

		function insert(sql, insertData, callback)
		{
			connection.query(sql, insertData, function(error, result)
			{
				if(error)
				{
					if(error.toString().match("ER_DUP_ENTRY: Duplicate entry .*? for key 'PRIMARY")!=null)
					{
						return common.errorResponse(response, "already be friends");
					}
					return common.errorResponse(response, "add friend failed");
				}
				if(result.affectedRows==0)
				{
					return common.errorResponse(response, "phone not found");
				}
				callback();
			})
		}
	}
}

function listFriend(response, postData)
{
	user.getUid(postData.token,onGetUid);
	function onGetUid(error,result)
	{
		var sql = "SELECT name,phone,photo,mail FROM ( SELECT friendUid AS uid FROM  `friend`  NATURAL JOIN ( SELECT uid AS selfUid FROM user WHERE token = ?) AS b ) AS c NATURAL JOIN user";
		response.writeHead(200, {"Content-Type": "text/plain"});
		if(error || result.length == 0)return common.errorResponse(response, "token error");
		connection.query(sql,[postData.token],function(error,results){
			if (error) {
				console.log(error);
				return common.errorResponse(response, "listFriend failed");
			};
			response.write(JSON.stringify(results));
			response.end();
		})
	}
}

exports.addFriend = addFriend;
exports.listFriend = listFriend;