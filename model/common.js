function errorResponse(response, errorMsg)
{
    var responseData = {};
    responseData.errorMsg = errorMsg;
    response.write(JSON.stringify(responseData));
    response.end();
}

exports.errorResponse = errorResponse;