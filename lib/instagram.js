const axios = require("axios");
const cache = require("./cache");

async function getInstagramInfo(username) {

    // Cache check
    const cached = cache.get(username);

    if (cached) {
        console.log("Cache Hit:", username);
        return cached;
    }

    // API Call
    const response = await axios.get(
        "https://flashapi1.p.rapidapi.com/ig/info_username/",
        {
            params: {
                user: username,
                nocors: "false"
            },
            headers: {
                "x-rapidapi-key": process.env.RAPID_API_KEY,
                "x-rapidapi-host": "flashapi1.p.rapidapi.com",
                "Content-Type": "application/json"
            },
            timeout: 15000
        }
    );

    console.log("API Response:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data && response.data.user) {

        cache.set(username, response.data.user);

        return response.data.user;
    }

    throw new Error("Invalid API Response");
}

module.exports = {
    getInstagramInfo
};
