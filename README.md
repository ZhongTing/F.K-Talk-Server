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


/listFriend
