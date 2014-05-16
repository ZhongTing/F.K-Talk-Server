var server = require("./server");
var router = require("./router");

var user = require("./newModel/user");
var friend = require("./newModel/friends");
var message = require("./newModel/message");

var handle = {}
handle["/login"] = user.login;
handle["/signup"] = user.signup;
handle["/setting"] = user.setting;
handle["/bind"] = user.bind;
handle["/checkIsMember"] = user.checkIsMember;
handle["/addFriends"] = friend.addFriends;
handle["/listFriends"] = friend.listFriends;
handle["/delFriend"] = friend.delFriend;
handle["/listCounter"] = message.listCounter;
handle["/sendMsg"] = message.sendMsg;
handle["/readMsg"] = message.readMsg;
handle["/listMsg"] = message.listMsg;



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