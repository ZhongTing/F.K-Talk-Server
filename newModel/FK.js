var type = {"FKTalk" : 0, "FB" : 1, "Google" :2};

function errorResponse(response, errorMsg)
{
    var responseData = {};
    responseData.errorMsg = errorMsg;
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(JSON.stringify(responseData));
    response.end();
}

exports.type = type;
exports.errorResponse = errorResponse;