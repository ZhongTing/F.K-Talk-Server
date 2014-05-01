var mqtt = require("./fkmqtt");

function errorResponse(response, errorMsg)
{
    var responseData = {};
    responseData.errorMsg = errorMsg;
    response.write(JSON.stringify(responseData));
    response.end();
}

function sendMqttAction(action,data)
{

}
exports.errorResponse = errorResponse;