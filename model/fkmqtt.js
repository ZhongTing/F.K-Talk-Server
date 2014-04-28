var mqtt = require('mqtt')
var client = mqtt.createClient(1883, '140.124.183.138');
var prefix = "FK-"

function publish(topic, message)
{
	client.publish(prefix.concat(topic), message);
	console.log(prefix.concat(topic));
}

exports.publish = publish;
exports.client = client;