var mysql = require('mysql');
  var connection = mysql.createConnection({
      host: '140.124.181.7',
      port: '2819',
      user: 'ISLab1221',
      password: '1221',
      database: 'fktalk'
  });
  connection.connect();

function start(response, postData) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" method="post">'+
    '<textarea name="text" rows="20" cols="60"></textarea>'+
    '<input type="submit" value="Submit text" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, postData) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("You've sent: " + postData);
  response.end();
}

function signup(response, postData)
{
  console.log(postData);
  response.end();
}

function login(response)
{
  connection.query('SELECT * FROM  user',function(error, results, fields){
      if(error){
          throw error;
      }
      response.writeHead(200, {"Content-Type": "text/plain"});
      console.log(results);
      response.end();
  });
}

exports.start = start;
exports.upload = upload;
exports.login = login;
exports.signup = signup;