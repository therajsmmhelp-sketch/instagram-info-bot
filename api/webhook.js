require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const { addUser } = require("../lib/database");
const { checkLimit } = require("../lib/limiter");

const app = express();

app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN);

const userState = new Map();

app.get("/", (req, res) => {
    res.send("Instagram Bot Running ✅");
});

app.post("/api/webhook", async (req, res) => {

    try {

        await bot.processUpdate(req.body);

    } catch (e) {

        console.error(e);

    }

    res.sendStatus(200);

});

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
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔍 Search Username",
                            callback_data: "search"
                        }
                    ],
                    [
                        {
                            text: "ℹ Help",
                            callback_data: "help"
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

Example

instagram

Don't use @ symbol.`

        );

    }

    if (query.data === "help") {

        await bot.sendMessage(

            chatId,

`📖 Usage

1. Click Search

2. Send username

3. Wait 2 seconds

4. Receive profile info`

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

`⏳ Please wait ${limit.left} seconds.`

        );

    }

    const username = msg.text.replace("@", "").trim();

    userState.delete(chatId);

    bot.sendMessage(

        chatId,

`🔍 Searching...

Username: ${username}`

    );

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Server Started");

});
