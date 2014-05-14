var db = require("./db");
var connection = db.connection;
var bcrypt = require("bcrypt-nodejs");
var uuid = require('node-uuid');
var FK = require('./FK')
var type = FK.type;
var graph = require('fbgraph');

function signup(response,data)
{
    var responseData = {};
    if(data.type==type.FKTalk)
    {
        data.password = bcrypt.hashSync(data.password);
    }
    data.token = uuid.v1();
    gcmRegId = data.gcmRegId;
    delete data.gcmRegId;

    connection.query('INSERT INTO user SET ?',data ,function(error, results, fields){
        if(error)return FK.errorResponse(response,"signup failed");
        var uid = results.insertId;
        insertOrUpdateGCM(uid, data.gcmRegId);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(results[0]));
        response.end();
        return common.errorResponse(response, "insert gcmRegId failed")
    });
}

function login(response, data)
{
    var responseData = {};
    var sql = 'SELECT uid, name, phone, mail, token, photo, password FROM user WHERE';
    var sqlData = [];
    switch(data.type)
    {
        case type.FKTalk:
            sql += ' phone = ?';
            sqlData[0] = data.phone;
            break;
        case type.FB:
            sql += ' FBID = ?';
            graph.setAccessToken(data.FBToken);
            graph.get("me?fields=id", function(err, res) {
                sqlData[0] = res.id;
            }
            break;
    }

    connection.query(sql ,[data.phone], function(error, results, fields){
        if(error)return FK.errorResponse(response,"login failed");
        if(results.length!=0)
        {
            if(bcrypt.compareSync(data.password,results[0].password))
            {
                if(data.gcmRegId)
                {
                    insertOrUpdateGCM(results[0].uid, data.gcmRegId);
                }
                delete results[0].uid;
                delete results[0].password;
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.write(JSON.stringify(results[0]));
                response.end();
            }
            else return common.errorResponse(response, "wrong password");
        }
        else return common.errorResponse(response, "phone not found");
    });
}

function insertOrUpdateGCM(uid, gcmRegId)
{
    var updateSQL = "UPDATE gcm AS g, ( SELECT gid FROM gcm WHERE uid = ? ) AS a SET gcmRegId = ? WHERE g.gid = a.gid";
    var uid = results[0].uid;
    connection.query(updateSQL, [results[0].uid,data.gcmRegId], function(error,results){
        if(!error && results.affectedRows==0)
        {
            var insertData = {"gcmRegId":data.gcmRegId,"uid":uid};
            connection.query("INSERT INTO gcm SET ?", insertData);
        }
    });
}

function setting(response, postData)
{
    var responseData = {};
    if(postData.password)postData.password = bcrypt.hashSync(postData.password);
    //token, photo, name, mail, password
    var token = postData.token;
    delete postData.token;
    var sql = "UPDATE user SET ? WHERE token = '"+token+"' LIMIT 1 ; ";
    connection.query(sql,postData,function(error, results, fields){
        response.writeHead(200, {"Content-Type": "text/plain"});
        if(error||results.changedRows==0)
        {
            return common.errorResponse(response,"setting failed");
        }
        var sql2 = "SELECT photo, phone, name, mail, gcmRegId, token FROM user natural join gcm WHERE token = ?;";
        console.log([token]);
        connection.query(sql2, [token], function(error, result){
            if(error||results.length==0)
            {
                return common.errorResponse(response,"setting failed");
            }
            response.write(JSON.stringify(result[0]));
            response.end();
        })
    });
}

function getUidByToken(token, callback)
{
    var sql = "SELECT uid FROM user WHERE token = ?";
    connection.query(sql, token, callback);
}

function getUidByPhone(phone, callback)
{
    var sql = "SELECT uid FROM user WHERE phone = ?";
    connection.query(sql, phone, callback);
}

function getUidAndNameByToken(token, callback)
{
    var sql = "SELECT uid, name FROM user WHERE token = ?";
    connection.query(sql, token, callback);
}

exports.signup = signup;
exports.login = login;
exports.setting = setting;
exports.getUidByToken = getUidByToken;
exports.getUidByPhone = getUidByPhone;
exports.getUidAndNameByToken = getUidAndNameByToken;