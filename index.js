var server = require("./server");
var router = require("./router");

var user = require("./newModel/user");
// var friend = require("./model/friends");
// var message = require("./model/message");

var handle = {}
handle["/login"] = user.login;
handle["/signup"] = user.signup;
handle["/setting"] = user.setting;
handle["/bind"] = user.bind;
handle["/checkIsMember"] = user.checkIsMember;
// handle["/addFriend"] = friend.addFriend;
// handle["/listFriend"] = friend.listFriend;
// handle["/sendMsg"] = message.sendMsg;
// handle["/readMsg"] = message.readMsg;
// handle["/listMsg"] = message.listMsg;
// handle["/listCounter"] = message.listCounter;
// handle["/delFriend"] = friend.deleteFriend;

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