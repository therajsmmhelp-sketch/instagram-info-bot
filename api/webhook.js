require("dotenv").config();

const { getInstagramInfo } = require("../lib/instagram");
const { formatNumber, yesNo, clean } = require("../lib/formatter");
const { addSearch } = require("../lib/database");
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const database=require("../lib/database");

const { addUser } = require("../lib/database");
const { checkLimit } = require("../lib/limiter");


const app = express();

app.use(express.json());

const isVercel = !!process.env.VERCEL;

const bot = new TelegramBot(
    process.env.BOT_TOKEN,
    isVercel ? {} : { polling: true }
);

const userState = new Map();

app.get("/", (req, res) => {
    res.send("Instagram Bot Running ✅");
});
bot.onText(/\/help/, async (msg) => {

    bot.sendMessage(
        msg.chat.id,

`📖 *Help*

/start - Start Bot

/help - Help

/about - About

/stats - Bot Statistics (Admin)

Simply send any Instagram username after clicking Search.`,

{
    parse_mode:"Markdown"
});

});


bot.onText(/\/about/, async(msg)=>{

    bot.sendMessage(

        msg.chat.id,

`🤖 *Instagram Info Bot*

Version : 1.0

Powered by

RapidAPI

Telegram Bot API

Node.js`

,

{
parse_mode:"Markdown"
});

});

bot.onText(/\/stats/, async(msg)=>{

    if(String(msg.from.id)!==String(process.env.ADMIN_ID)){

        return;

    }

    const data = database.read();;

    bot.sendMessage(

        msg.chat.id,

`📊 Bot Statistics

👥 Users

${data.stats.totalUsers}

🔎 Searches

${data.stats.totalSearches}

📁 Search History Stored

${data.searches.length}`

    );

});

bot.onText(/\/history/, async(msg)=>{

    if(String(msg.from.id)!==String(process.env.ADMIN_ID)){

        return;

    }

    const data = database.read();

    let text="🕒 Last Searches\n\n";

    data.searches.slice(0,10).forEach((x,i)=>{

        text+=`${i+1}. ${x.username}\n${x.date}\n\n`;

    });

    bot.sendMessage(msg.chat.id,text);

});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {

    if (String(msg.from.id) !== String(process.env.ADMIN_ID))
        return;

    const message = match[1];

    const data = database.read();

    let sent = 0;

    for (const id of data.users) {

        try {

            await bot.sendMessage(id, message);

            sent++;

        } catch (e) {}

    }

    bot.sendMessage(
        msg.chat.id,
        `✅ Broadcast Sent\n\nUsers : ${sent}`
    );

});

bot.onText(/\/users/, async (msg) => {

    if (String(msg.from.id) !== String(process.env.ADMIN_ID))
        return;

    const data = database.read();

    bot.sendMessage(
        msg.chat.id,
        `👥 Total Users : ${data.users.length}`
    );

});
if (isVercel) {

    app.post("/api/webhook", async (req, res) => {

        try {

            await bot.processUpdate(req.body);

        } catch (e) {

            console.error(e);

        }

        res.sendStatus(200);

    });

}

bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;

    addUser(chatId);

    await bot.sendMessage(

        chatId,

`📸 *Instagram Profile Finder*

Welcome!

Click the button below to search any Instagram account.`,

        {
            parse_mode: "Markdown",
            reply_markup:{
inline_keyboard:[

[
{
text:"🔍 Search Username",
callback_data:"search"
}
],

[
{
text:"ℹ Help",
callback_data:"help"
},
{
text:"🤖 About",
callback_data:"about"
}
]

]
}
        }

    );

});

bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;

    if (query.data === "search") {

        userState.set(chatId, "waiting_username");

        await bot.sendMessage(
            chatId,
            `✍ Send Instagram Username

Example:
instagram

Don't use @ symbol.`
        );

    }

    if (query.data === "about") {

        await bot.sendMessage(
            chatId,
            `🤖 Instagram Information Bot

Developer: Raj

Version: 1.0`
        );

    }

    if (query.data === "help") {

        await bot.sendMessage(
            chatId,
            `📖 Usage

1. Click Search
2. Send username
3. Wait
4. Receive profile`
        );

    }

    await bot.answerCallbackQuery(query.id);

});
 
bot.on("message", async (msg) => {

    if (!msg.text) return;

    if (msg.text.startsWith("/")) return;

    const chatId = msg.chat.id;

    if (userState.get(chatId) !== "waiting_username") return;

    const limit = checkLimit(chatId);

    if (!limit.allowed) {

        return bot.sendMessage(
            chatId,
            `⏳ Please wait ${limit.left} seconds before searching again.`
        );

    }

    userState.delete(chatId);

    const username = msg.text.replace("@", "").trim();

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {

        return bot.sendMessage(
            chatId,
            "❌ Invalid Instagram username."
        );

    }

    const loading = await bot.sendMessage(
        chatId,
        "🔍 Fetching profile..."
    );

    try {

        const user = await getInstagramInfo(username);
        addSearch(username);
        
       

        const message =
`📸 *Instagram Profile*

👤 Username : @${clean(user.username)}

🆔 ID : ${clean(user.pk_id)}

👥 Followers : ${formatNumber(user.follower_count)}

➡ Following : ${formatNumber(user.following_count)}

📷 Posts : ${formatNumber(user.media_count)}

✔ Verified : ${yesNo(user.is_verified)}

🔒 Private : ${yesNo(user.is_private)}

🌐 Website :
${clean(user.external_url)}

📝 Bio :

${clean(user.biography)}

━━━━━━━━━━━━━━
Powered By RapidAPI`;

        await bot.deleteMessage(chatId, loading.message_id)
.catch(()=>{});

        if (
            user.hd_profile_pic_url_info &&
            user.hd_profile_pic_url_info.url
        ) {

            await bot.sendPhoto(
    chatId,
    user.hd_profile_pic_url_info.url,
     {

    caption: message,

    parse_mode: "Markdown",

    reply_markup:{

        inline_keyboard:[

            [
                {
                    text:"🔎 Search Again",
                    callback_data:"search"
                }
            ],

            [
                {
                    text:"📢 Share Bot",
                    url:"https://t.me/heyrajprajapati"
                }
            ]

        ]

    }

});

        } else if (user.profile_pic_url) {

            await bot.sendPhoto(
                chatId,
                user.profile_pic_url,
                {
                    caption: message,
                    parse_mode: "Markdown"
                }
            );

        } else {

            await bot.sendMessage(
                chatId,
                message,
                {
                    parse_mode: "Markdown"
                }
            );

        }

    } catch (err) {

    console.log("========== ERROR ==========");
    console.log("Status:", err.response?.status);
    console.log("Response:", JSON.stringify(err.response?.data, null, 2));
    console.log("Message:", err.message);
    console.log("===========================");

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    await bot.sendMessage(
    chatId,
    "❌ Username not found or API limit exceeded.",
    {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔍 Search Other Username",
                        callback_data: "search"
                    }
                ]
            ]
        }
    }
);

}

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Server Started");

});
