var connection = require('./db').connection;
var FK = require('./FK');
var mqtt = require('./fkmqtt');
var gcm = require('./gcmService');

function addFriends(response, postData){
	var sql = "select uid, token, name, phone, photo, mail, -1 as hasReadMsgId from user where ";
	var keyword = "phone = ";
	if(postData.type==FK.type.FB)keyword = "FBID = ";
	for(var i in postData.args)
	{
		sql += keyword + postData.args[i] + "||";
	}
	sql += "marker"
	sql = sql.replace("||marker","");
	response.end();
	var querySelfSQL = "SELECT uid, name, phone, photo, mail, -1 as hasReadMsgId FROM user where token = ?";
	connection.query(querySelfSQL, postData.token, function(err, selfInfos){
		if(err || selfInfos.length==0)return mqtt.action(postData.token, "error", "token error");
		var uid = selfInfos[0].uid;
		connection.query(sql, [], function(error, friendInfos) {
		 	if(error)return mqtt.action(postData.token, "error", "addFriends failed");
		 	var data = [];
		 	for(var i in friendInfos)
		 	{
		 		var element = [];
		 		element[0] = friendInfos[i].uid;
		 		element[1] = uid;
		 		data.push(element);
		 		data.push(element.slice(0).reverse());
		 	}
		 	connection.query("insert into friend (selfUID,friendUID) values ?", [data],function(error, insertResults){
		 		if(error)
		 		{
		 			if(error.code=="ER_DUP_ENTRY")
						return mqtt.action(postData.token, "error","friend exsit!");
					else
						return mqtt.action(postData.token, "error","addFriends failed");
		 		}
		 		for(var i in friendInfos)
		 		{
		 			mqtt.action(friendInfos[i].token, "updateFriends", selfInfos[0]);
		 			var m = gcm.newMsg();
					var message = selfInfos[0].name + "已經成為你的好友";
					m.addData("message", message);
					gcm.sendByPhone(friendInfos[i].phone,m);
		 		}
		 		mqtt.action(postData.token, "updateFriends", friendInfos);
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
