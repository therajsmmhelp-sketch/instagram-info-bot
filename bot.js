require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN);

const waitingUsers = new Set();

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id,

`📸 *Instagram Information Bot*

Get complete Instagram profile information instantly.

Click the button below 👇`,

{
    parse_mode: "Markdown",
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "🔍 Instagram Info",
                    callback_data: "insta_info"
                }
            ]
        ]
    }
});

});

bot.on("callback_query", async (query)=>{

    const chatId = query.message.chat.id;

    if(query.data=="insta_info"){

        waitingUsers.add(chatId);

        bot.sendMessage(chatId,

`✍ Send Instagram Username

Example

therajsmm

Don't write @ symbol.`);
    }

    bot.answerCallbackQuery(query.id);

});

bot.on("message", async(msg)=>{

    const chatId=msg.chat.id;

    if(msg.text.startsWith("/")) return;

    if(!waitingUsers.has(chatId)) return;

    waitingUsers.delete(chatId);

    const username=msg.text.replace("@","").trim();

    const loading=await bot.sendMessage(chatId,"⏳ Fetching Information...");

    try{

        const response=await axios.get(
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
                }
            }
        );

        const user=response.data.user;

        let caption=

`👤 Name : ${user.full_name || "-"}

📛 Username : @${user.username}

🆔 ID : ${user.pk_id}

👥 Followers : ${user.follower_count || 0}

➡ Following : ${user.following_count || 0}

📸 Posts : ${user.media_count || 0}

✔ Verified : ${user.is_verified ? "Yes":"No"}

🔒 Private : ${user.is_private ? "Yes":"No"}

📝 Bio :

${user.biography || "No Bio"}

🌍 Website :

${user.external_url || "None"}
`;

        await bot.deleteMessage(chatId,loading.message_id);

        if(user.hd_profile_pic_url_info){

            await bot.sendPhoto(
                chatId,
                user.hd_profile_pic_url_info.url,
                {
                    caption,
                    parse_mode:"Markdown"
                }
            );

        }else{

            bot.sendMessage(chatId,caption);

        }

    }catch(err){

        await bot.deleteMessage(chatId,loading.message_id);

        bot.sendMessage(chatId,

`❌ Username not found

or

API Limit Exceeded.`);
    }

});
