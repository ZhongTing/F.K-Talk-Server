var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var user = require("./model/user");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/login"] = user.login;
handle["/signup"] = user.signup;
handle["/uploadPhoto"] = user.uploadPhoto;

server.start(router.route, handle);