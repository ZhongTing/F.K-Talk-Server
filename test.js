var mqtt = require('./model/fkmqtt')
client = mqtt.client;

var topic = 'FK20987103180';
client.subscribe(topic);
console.log(topic);
client.on('message', function (topic, message) {
  console.log(message);
});