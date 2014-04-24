F.K-Talk-Server
===============

行動網路應用與設計期中專案
module

      mysql
      node-uuid
      urlencode
      bcrypt-nodejs
api

/signup

      phone : 'phone',
      password : 'password',
      name : 'name',
      mail : 'mail',
      gcmRegId : '12345'
      photo : '',
    
    return {name, phone, mail, token, photo}
    error "signup failed"
    error "retrieve user info error"
    
/login

      phone : 'phone'
      password : 'password'
      gcmRegId : '12345'

      
    return {name, phone, mail, token, photo}
    error "login failed"
    error "login failed : wrong password"
    error "login failed : phone not found"

/uploadPhoto

      token
      photo

    return {};
    error "uploadPhoto failed"


/addFriend
    
      token
      phone    

    return {};
    error "token error"
    error "already be friends"
    error "add friend failed"
    error "phone not found"

/listFriend
      
      token

    return {friends:[{name,phone,photo,mail,readTime}]}; //readTime是指朋友已讀自己的訊息時間
    error "token error"


/sendMsg
      
      phone
      message
      token

    return {timestamp};     //unixtimestamp
    error "token error"
    error "message empty"
    error "phone not found"
    error "sendMsg failed"


/readMsg
      phone
      token

    return {timestamp}      //unixtimestamp
    error "token error"
    error "send read message failed"
    error "sql error" (直接丟出sql error)

/listMsg
      phone
      token
      timestamp     //unixtimestamp

    return {msgs:[name, phone, msg,timestamp]}    //unixtimestamp
    error "token error"
    error "sql error" (直接丟出sql error)

/getFriendRead
      phone
      token

    return {"readTime"}
    error "sql error"
    error "get friend read failed"

    