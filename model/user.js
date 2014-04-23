var db = require("./db");
var connection = db.connection;
var bcrypt = require("bcrypt-nodejs");
var uuid = require('node-uuid');
var common = require('./common');

function signup(response,data)
{
    var responseData = {};
    data.password = bcrypt.hashSync(data.password);
    data.token = uuid.v1();
    gcmRegId = data.gcmRegId;
    delete data.gcmRegId;

    connection.query('INSERT INTO user SET ?',data ,function(error, results, fields){
        response.writeHead(200, {"Content-Type": "text/plain"});
        // if(error)return common.errorResponse(response,"signup failed");
        if(error)throw error;
        var querySQL = "SELECT name, phone, mail, token, photo FROM user WHERE uid = ?";
        try
        {
            insertGCM({"gcmRegId":gcmRegId,"uid":results.insertId},function(){
            connection.query(querySQL, results.insertId,function(error, results){
            if(error || results.length==0)return common.errorResponse(response,"retrieve user info error")
                response.write(JSON.stringify(results[0]));
                response.end();
                });
            });
        }
        catch(error)
        {
        return common.errorResponse(response, "insert gcmRegId failed")
        }
    });
}

function insertGCM(insertData, onSuccess)
{
    var insertGcmSQL = "INSERT INTO gcm SET ?";
    connection.query(insertGcmSQL,insertData,function(error, result){
    if (error) {throw error};
        onSuccess();
    });
}

function login(response, data)
{
    var responseData = {};
    var sql = 'SELECT uid, name, phone, mail, token, photo, password FROM user WHERE phone = ?';
    connection.query(sql ,[data.phone], function(error, results, fields){
        response.writeHead(200, {"Content-Type": "text/plain"});
        if(error)return common.errorResponse(response,"login failed");
        if(results.length!=0)
        {
            if(bcrypt.compareSync(data.password,results[0].password))
            {
                try
                {
                    if(data.gcmRegId)
                    {
                        insertGCM({"gcmRegId":data.gcmRegId,"uid":results[0].uid})
                    }
                }
                catch(error){
                    console.log(error);
                }
                delete results[0].uid;
                delete results[0].password;
                response.write(JSON.stringify(results[0]));
                response.end();
            }
            else return common.errorResponse(response, "wrong password");
        }
        else return common.errorResponse(response, "phone not found");
    });
}

function uploadPhoto(response, postData)
{
    console.log(postData.token);
    console.log(postData.photo.length);
    var sql = "UPDATE user SET photo = ? WHERE token = ? LIMIT 1 ; ";
    connection.query(sql,[postData.photo,postData.token],function(error, results, fields){
        response.writeHead(200, {"Content-Type": "text/plain"});
        if(error)return common.errorResponse(response,"uploadPhoto failed");
        response.write("{}");
        response.end();
    });
}

function getUid(token, callback)
{
    var sql = "SELECT uid FROM user WHERE token = ?";
    connection.query(sql, token, callback);
}

exports.signup = signup;
exports.login = login;
exports.uploadPhoto = uploadPhoto;
exports.getUid = getUid;