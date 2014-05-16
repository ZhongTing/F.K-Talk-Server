DELETE FROM friend WHERE (
selfUID,
friendUID
) IN (
SELECT * 
FROM (

SELECT uid AS selfUID
FROM user
WHERE uid =1
OR phone =123
) AS t, (

SELECT uid AS friendUID
FROM user
WHERE uid =1
OR phone =123
) AS a
WHERE selfUID != friendUID)