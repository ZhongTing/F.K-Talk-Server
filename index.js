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
handle["/getFriendRead"] = message.getFriendRead;
handle["/deleteFriend"] = friend.deleteFriend;

var os=require('os');
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      console.log(dev+(alias?':'+alias:''),details.address);
      ++alias;
    }
  });
}
server.start(router.route, handle);