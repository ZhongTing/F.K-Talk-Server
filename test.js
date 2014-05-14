var graph = require('fbgraph');
graph.setAccessToken("CAACEdEose0cBAB0NYWWQO2vychNHxeX5xlugZBJoJ3vhO4lkqSeGemZAc9mD7oyQFi42uYmJkGOPPvZB8SubObSsDZCye906W5XGN7G1yzEyINZBU6URDXYjBb6SWm97xWcZBHHCLLwuGIzKD1ckiFcCK3nJIcsrMQviP72rLVUv7M1ykslnIXenSHkOwoJe5svRTLxQIZCIAZDZD");
graph.get("me", function(err, res) {
  console.log(res); // { id: '4', name: 'Mark Zuckerberg'... }
});
