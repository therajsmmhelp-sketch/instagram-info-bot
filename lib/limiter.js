const users = new Map();

const LIMIT = 10000;

function checkLimit(chatId){

    const now = Date.now();

    if(users.has(chatId)){

        const diff = now - users.get(chatId);

        if(diff < LIMIT){

            return {
                allowed:false,
                left:Math.ceil((LIMIT-diff)/1000)
            };

        }

    }

    users.set(chatId,now);

    return {
        allowed:true
    };

}

module.exports={
    checkLimit
};
