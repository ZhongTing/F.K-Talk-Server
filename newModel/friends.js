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
	var sql = "SELECT user.name, user.phone, user.photo, user.mail, hasReadMsgId\
		FROM friend 															\
		INNER JOIN user ON friendUID = user.uid, (								\
			SELECT * 															\
			FROM user															\
			WHERE token = ?														\
		) AS self 																\
		WHERE self.uid = selfUID";
	connection.query(sql, [postData.token], function(error, results){
		if(error)return mqtt.action(postData.token, "error", "listFriends error");
		mqtt.action(postData.token, "listFriends", results);
		response.end();
	})
}

function delFriend (response, postData) {
	var sql = "\
		DELETE FROM friend 				\
		WHERE (selfUID,	friendUID) 		\
		IN (							\
			SELECT * 					\
			FROM (						\
				SELECT uid AS selfUID	\
				FROM user				\
				WHERE token = ?			\
				OR phone = ? 			\
			) AS t, (					\
				SELECT uid AS friendUID	\
				FROM user				\
				WHERE token = ?			\
				OR phone = ? 			\
				) AS a 					\
			WHERE selfUID != friendUID	\
		)";
	var sqlData = [postData.token, postData.phone, postData.token, postData.phone];
	connection.query(sql, sqlData, function(error, results){
		if(error||results.affectedRows!=2)
		{
			if(results.affectedRows==0)
				return mqtt.action(postData.token, "error", "not friends");
			else
				return mqtt.action(postData.token, "error", "delFriend error");
		}
		var sql = "select * FROM\
			(SELECT token FROM user where phone = ?) as a,\
			(SELECT phone FROM user where token = ?) as b";
		connection.query(sql, [postData.phone, postData.token],function(error,results){
			mqtt.action(postData.token, "deleteFriend", postData.phone);
			mqtt.action(results[0].token, "deleteFriend", results[0].phone);
		})
		response.end();
	})
}

exports.addFriends = addFriends;
exports.listFriends = listFriends;
exports.delFriend = delFriend;
