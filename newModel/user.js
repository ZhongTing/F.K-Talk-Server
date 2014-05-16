var db = require("./db");
var connection = db.connection;
var bcrypt = require("bcrypt-nodejs");
var uuid = require('node-uuid');
var FK = require('./FK')
var type = FK.type;
var graph = require('fbgraph');

function signup(response,data)
{
    var insertData = {};
    switch(data.type)
    {
        case type.FKTalk:
            data.password = bcrypt.hashSync(data.arg);
            break;
        case type.FB:
            data.FBID = data.arg;
            break;
        case type.googleID:
            data.googleID = data.arg;
            break;
    }
    data.token = uuid.v1();
    gcmRegId = data.gcmRegId;
    delete data.gcmRegId;
    delete data.arg;
    delete data.type;
    connection.query('INSERT INTO user SET ?',data ,function(error, results, fields){
        if(error)
        {
            if(error.code=="ER_DUP_ENTRY")
                return FK.errorResponse(response,"account exsit!");
            else
                return FK.errorResponse(response,"signup failed");
        }
        var uid = results.insertId;
        insertOrUpdateGCM(uid, gcmRegId, function(){
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write("{}");
            response.end(); 
        });
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
            sqlData[0] = data.arg.phone;
            doLogin(sql, sqlData);
            break;
        case type.FB:
            sql += ' FBID = ?';
            graph.setAccessToken(data.arg);
            graph.get("me?fields=id", function(err, res) {
                sqlData[0] = res.id;
                doLogin(sql, sqlData);
            });
            break;
    }
    function doLogin(sql, sqlData)
    {
        connection.query(sql, sqlData, function(error, results){
            if(error)return FK.errorResponse(response,"login failed");
            if(results.length!=0)
            {
                if(data.type==type.FKTalk && !bcrypt.compareSync(data.arg.password,results[0].password))
                {
                    return FK.errorResponse(response, "wrong password");
                }
                insertOrUpdateGCM(results[0].uid, data.gcmRegId);
                delete results[0].uid;
                delete results[0].password;
                results[0].arg = data.arg;
                results[0].type = data.type;
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.write(JSON.stringify(results[0]));
                response.end();
            }
            else return FK.errorResponse(response, "account information not found");
        });
    }
}

function bind(response, postData)
{
    var sql = "SELECT token from user where ?? = ?";
    var sqlData = [];
    var typeSQL;
    if(postData.type==type.FB)
    {
        typeSQL = "FBID"
        sqlData[1] = postData.arg;
    }
    sqlData[0] = typeSQL;
    connection.query(sql, sqlData, function(error, results){
        if(error)return FK.errorResponse(response, "bind error");
        if(results.length!=0)
        {
            if(results[0].token==postData.token)
            {
                return FK.errorResponse(response, "account has binded before");
            }
            else return FK.errorResponse(response, "fb account has been used");
        }
        console.log(results);
        sqlData[2] = postData.token;
        sql = "UPDATE user SET ?? = ? WHERE token = ?";
        connection.query(sql, sqlData, function(error, results){
            if(error || results.affectedRows == 0)
                return FK.errorResponse(response, "bind failed");
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write("{}");
            response.end();
        })
    })
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
        if(error||results.changedRows==0)
        {
            return common.errorResponse(response,"setting failed");
        }
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("{}");
        response.end();
    });
}

function checkIsMember(response, postData)
{
    var sql = "SELECT phone FROM user WHERE phone = ?";
    connection.query(sql, [postData.phone], function(error, results){
        if(error)return FK.errorResponse(response, "check error");
        var resultObj = {};
        resultObj.result = results.length != 0;
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(resultObj));
        response.end();
    })
}
function insertOrUpdateGCM(uid, gcmRegId, callback)
{
    var updateSQL = "UPDATE gcm AS g, ( SELECT gid FROM gcm WHERE uid = ? ) AS a SET gcmRegId = ? WHERE g.gid = a.gid";
    if(!gcmRegId)return callback();
    connection.query(updateSQL, [uid, gcmRegId], function(error,results){
        if(!error && results.affectedRows==0)
        {
            var insertData = {"gcmRegId":gcmRegId,"uid":uid};
            connection.query("INSERT INTO gcm SET ?", insertData, function(){
                callback();
            });
        }
        else
        {
            callback();
        }
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
exports.bind = bind;
exports.checkIsMember = checkIsMember;

exports.getUidByToken = getUidByToken;
exports.getUidByPhone = getUidByPhone;
exports.getUidAndNameByToken = getUidAndNameByToken;