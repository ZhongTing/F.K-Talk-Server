var mqtt = require('mqtt')
var client = mqtt.createClient(1883, '140.124.183.138');
var prefix = "FK"
var connectoin = require("./db").connectoin;
var common = require("./common");

function publish(topic, message)
{
	client.publish(prefix.concat(topic), message);
	console.log("mqtt---------");
	console.log(prefix.concat(topic));
	console.log(message);
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