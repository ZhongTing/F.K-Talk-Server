var mysql = require('mysql');
var connection = mysql.createConnection({
	host: '140.124.181.7',
	port: '2819',
	user: 'ISLab1221',
	password: '1221',
	database: 'fktalk'
});
connection.connect();

exports.connection = connection;
