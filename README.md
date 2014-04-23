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

    return {friends:[{name,phone,photo,mail}]};
    error "token error"


/sendMsg
      
      phone
      message
      token

    return {timestamp};


/readMsg
      phone
      token

    return {timestamp}


/listMsg
      phone
      token
      timestamp

    return {msgs:[msg,timestamp]}

