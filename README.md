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
      mail : 'mail'
      token : 'token'
    
    return token
    error "signup failed"
    
/login

      phone : 'phone'
      password : 'password'
      
    return token
    error "login failed : wrong password"
    error "login failed : phone not found"


/addFriend


/listFriend
