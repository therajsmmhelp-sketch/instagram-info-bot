const axios = require("axios");

async function getInstagramInfo(username){

    const response = await axios.get(

        "https://flashapi1.p.rapidapi.com/ig/info_username/",

        {

            params:{

                user:username,

                nocors:false

            },

            headers:{

                "x-rapidapi-key":process.env.RAPID_API_KEY,

                "x-rapidapi-host":"flashapi1.p.rapidapi.com",

                "Content-Type":"application/json"

            },

            timeout:15000

        }

    );

    return response.data.user;

}

module.exports={

    getInstagramInfo

};
