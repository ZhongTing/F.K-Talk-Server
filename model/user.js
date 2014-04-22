var db = require("./db");
var connection = db.connection;
var bcrypt = require("bcrypt-nodejs");
var uuid = require('node-uuid');

function signup(response,data)
{
  console.log(data);
  data.password = bcrypt.hashSync(data.password);
  data.token = uuid.v1();
  connection.query('INSERT INTO user SET ?',data ,function(error, results, fields){
	  response.writeHead(200, {"Content-Type": "text/plain"});
      if(error){
      	response.write("signup failed");
      	response.end();
      	return;
      }
      console.log(data.token);
      response.end();
  });
}

function login(response, data)
{
  var password = bcrypt.hashSync(data.password);
  connection.query('SELECT token FROM user WHERE phone = ??, password = ?',data.phone, password ,function(error, results, fields){
	  response.writeHead(200, {"Content-Type": "text/plain"});
      if(error){
      	response.write("error");
      	response.end();
      	return;
      }
      console.log(results);
      response.end();
  });
  response.end();
}

function checkAccount(data)
{
  connection.query('SELECT * FROM  user',function(error, results, fields){
      if(error){
          throw error;
      }
      console.log(results);
  });
}

exports.signup = signup;
exports.login = login;
exports.checkAccount = checkAccount;
