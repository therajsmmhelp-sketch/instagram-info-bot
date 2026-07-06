require("dotenv").config();

const {getInstagramInfo}=require("./lib/instagram");

(async()=>{

    const user=await getInstagramInfo("instagram");

    console.log(user.username);

    console.log(user.full_name);

})();
