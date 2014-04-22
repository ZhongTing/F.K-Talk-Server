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
      token : 'token',
      gcmRegId : '12345'
    
    return {name, phone, mail, token, picture}
    error "signup failed"
    error "retrieve user info error"
    
/login

      phone : 'phone'
      password : 'password'
      gcmRegId : '12345'

      
    return {name, phone, mail, token, picture}
    error "login failed"
    error "login failed : wrong password"
    error "login failed : phone not found"


/addFriend


/listFriend
