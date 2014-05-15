var connection = require('./newModel/db').connection;
var sql = "select uid from user where "
var datas = ['123','0987103181'];
var uid = 1;
console.log(datas.reverse());
for(var data in datas)
{
	sql += "phone = " + datas[data] + "||";
}
sql += "marker"
sql = sql.replace("||marker","");
console.log(sql);
connection.query(sql, [], function(err, info) {
 	if(err)console.log(err);
 	var data = [];
 	for(var i in info)
 	{
 		var element = [];
 		element[0] = info[i].uid;
 		element[1] = uid;
 		data.push(element);
 		data.push(element.slice(0).reverse());
 	}
 	console.log(data);
 	connection.query("insert into friend (selfUID,friendUID) values ?", [data],function(error,result){
 		if(error)console.log(error.Error);
 		else console.log(result);
 	})
});