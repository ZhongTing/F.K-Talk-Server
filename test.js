var d = Math.round(Date.now()/1000);
var date = new Date(d*1000);
console.log(d);
console.log(date);
console.log(date.format);

SELECT * from (SELECT uid, name,phone,photo,mail FROM ( SELECT friendUid AS uid FROM  `friend`  NATURAL JOIN ( SELECT uid AS selfUid FROM user WHERE token = "c295e0e0-ca9f-11e3-b") AS b ) AS c NATURAL JOIN user) as leftpart left JOIN friend on leftpart.uid = friend.selfUid and friend.friendUid = b.uid