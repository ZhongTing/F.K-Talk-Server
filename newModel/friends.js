var connection = require('./db').connection;
var FK = require('./FK');

function addFriends(response, postData){
	var sql = "select uid from user where ";
	for(var i in postData.args)
	{
		sql += "phone = " + postData.args[i] + "||";
	}
	sql += "marker"
	sql = sql.replace("||marker","");
	
	connection.query("SELECT uid FROM user where token = ?", postData.token, function(err,results){
		if(err||results.length==0)return FK.errorResponse(response, "token error");
		var uid = results[0].uid;
		connection.query(sql, [], function(error, info) {
		 	if(error)return FK.errorResponse(response, "addFriends failed");
		 	var data = [];
		 	for(var i in info)
		 	{
		 		var element = [];
		 		element[0] = info[i].uid;
		 		element[1] = uid;
		 		data.push(element);
		 		data.push(element.slice(0).reverse());
		 	}
		 	connection.query("insert into friend (selfUID,friendUID) values ?", [data],function(error,result){
		 		if(error)
		 		{
		 			if(error.code=="ER_DUP_ENTRY")
		                return FK.errorResponse(response,"friend exsit!");
		            else
		                return FK.errorResponse(response,"addFriends failed");
		 		}
		 	})
		});
	});
}

function listFriends(response, postData){

}

function delFriend (response, postData) {
	
}

exports.addFriends = addFriends;
exports.listFriends = listFriends;
exports.delFriend = delFriend;
