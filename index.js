var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var user = require("./model/user");
var friend = require("./model/friends");
var message = require("./model/message");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/login"] = user.login;
handle["/signup"] = user.signup;
handle["/uploadPhoto"] = user.uploadPhoto;
handle["/addFriend"] = friend.addFriend;
handle["/listFriend"] = friend.listFriend;
handle["/sendMsg"] = message.sendMsg;
handle["/readMsg"] = message.readMsg;
handle["/listMsg"] = message.listMsg;

server.start(router.route, handle);