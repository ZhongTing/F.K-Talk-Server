F.K-Talk-Server
===============

行動網路應用與設計期中專案

api

/signup

      phone : 'phone',
      password : 'password',
      name : 'name',
      mail : 'mail'
    
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
