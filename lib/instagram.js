const axios = require("axios");

async function getInstagramInfo(username) {

    try {

        const response = await axios.get(
            "https://flashapi1.p.rapidapi.com/ig/info_username/",
            {
                params: {
                    user: username,
                    nocors: false
                },
                headers: {
                    "x-rapidapi-key": process.env.RAPID_API_KEY,
                    "x-rapidapi-host": "flashapi1.p.rapidapi.com"
                },
                timeout: 15000
            }
        );

        return response.data;

    } catch (err) {

        throw new Error("Instagram API Error");

    }

}

module.exports = {
    getInstagramInfo
};
