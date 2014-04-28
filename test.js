var gcm = require('./model/gcmService')
var m = gcm.newMsg();
                    var message = '123';
                    var newMessageMsg = {};
                    m.addData("newmessage", JSON.stringify(newMessageMsg));
                    m.addData("message",message);
var mqtt = require('./model/fkmqtt')

mqtt.client.subscribe("FK-0987103180");
mqtt.publish("0987103180",JSON.stringify(m.data));


mqtt.client.on('message', function(topic, message) {
  console.log(topic);
  console.log(message);
});
console.log('end');