var mqtt = require('mqtt')
var fs = require('fs')
var client = mqtt.createClient(1883, '140.124.183.138', {clientId: "FKServer", clean: false});
var prefix = "FK"
var connectoin = require("./db").connectoin;

function publish(topic, message)
{
	client.publish(prefix.concat(topic), message, {qos:1, retain:false});
	console.log("mqtt---------");
	console.log(prefix.concat(topic));
	console.log(message.length > 1000 ? message.substr(0, 50) + "...(size: " + message.length + ")" : message);
	fs.writeFile('log.txt', "\n " + message, {flag: "a"}, function (err) {
		if (err) throw err;
	});
}

function action(target, action, data)
{
	var a = {};
	a.action = action;
	a.data = data;
	publish(target,JSON.stringify(a));
}

exports.publish = publish;
exports.action = action;
exports.client = client;