var graph = require('fbgraph');
graph.setAccessToken("CAACEdEose0cBACd8NqrK3S4e9uNFCnat5bTI3YMxT7AutD2RwuPNLXAlj8LGOEHh8A1i7tzTCyLbIhjFpCbf2z63RFHZAKAfeVzsCW3mhJuNHlZBG7NAemEvnudqQoEx3jhinfY45hip5LbtRVEuUZCknkYVWqZA3wq4BphWmsf6zhDui3eAigkk12bE9xkZD");
graph.get("me?fields=id", function(err, res) {
  console.log(res.id); // { id: '4', name: 'Mark Zuckerberg'... }
});
