var GCM = require('gcm').GCM;

var apiKey = 'AIzaSyBsf4l9d4mpSaT2QH9ybpRd6GccU-367RU';
var gcm = new GCM(apiKey);

var message = {
    collapse_key: 'Collapse key', 
    'data.key1': 'value1',
    'data.key2': 'value2',
    data : {message : "hello"}
};
function send(regId,msgObject,callback)
{
	console.log(apiKey);
	msgObject.registration_id = regId;
	gcm.send(message, function(err, messageId){
	    if (err) {
	    	console.log(err);
	        console.log("Something has gone wrong!");
	    } else {
	        console.log("Sent with message ID: ", messageId);
	    }
	});
}
exports.send = send;