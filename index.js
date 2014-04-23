var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/login"] = requestHandlers.login;
handle["/signup"] = requestHandlers.signup;
handle["/uploadPhoto"] = requestHandlers.uploadPhoto;

server.start(router.route, handle);