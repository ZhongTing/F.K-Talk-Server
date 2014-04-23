var http = require("http");
var url = require("url");
var urlencode = require("urlencode");
var querystring = require("querystring")

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+
      postDataChunk + "'.");
    });

    request.addListener("end", function() {
      // postData = urlencode.decode(postData);
      // postData = querystring.parse(postData);
      postData = JSON.parse(postData);
      console.log("postData");
      console.log(postData);
      route(handle, pathname, response, postData);
    });

  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;