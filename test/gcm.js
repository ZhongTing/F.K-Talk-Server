var gcm = require("../model/gcmService");
var id = 'APA91bHMkZ7f1PyaO2CB29nUyZJll7_hw1l1eYulQdkAfgWlMhv_8oSmbOd9YH1F3ln00YEajZVN_1d30MWV-o-VJL_KA1vW44FYMwx8DvZpu2P-fFKuwOaaf_fSZq14qvP17qCcPxrVLdYbxA-nbWDu2RWTjl4L-g';

var message = {
    collapse_key: 'Collapse key', 
    data : {message : "hello"}
};

gcm.send(id,message);
